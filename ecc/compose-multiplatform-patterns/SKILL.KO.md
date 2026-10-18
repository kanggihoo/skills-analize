---
name: compose-multiplatform-patterns
description: KMP 프로젝트를 위한 Compose Multiplatform 및 Jetpack Compose 패턴 — 상태 관리, 네비게이션, 테마, 성능, 플랫폼별 UI. KMP 프로젝트에서 Compose 또는 Jetpack Compose UI, 상태, 네비게이션, 테마를 구현할 때 사용합니다.
metadata:
  origin: ECC
---

# Compose Multiplatform 패턴

Compose Multiplatform과 Jetpack Compose를 사용하여 Android, iOS, Desktop, Web에서 공유 UI를 만드는 패턴입니다. 상태 관리, 네비게이션, 테마, 성능을 다룹니다.

## 활성화 시점

- Compose UI(Jetpack Compose 또는 Compose Multiplatform)를 만들 때
- ViewModel과 Compose 상태로 UI 상태를 관리할 때
- KMP 또는 Android 프로젝트에서 네비게이션을 구현할 때
- 재사용 가능한 컴포저블과 디자인 시스템을 설계할 때
- 리컴포지션과 렌더링 성능을 최적화할 때

## 상태 관리

### ViewModel + 단일 상태 객체

화면 상태에는 단일 데이터 클래스를 사용하세요. 이를 `StateFlow`로 노출하고, Compose에서 수집합니다.

```kotlin
data class ItemListState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val searchQuery: String = ""
)

class ItemListViewModel(
    private val getItems: GetItemsUseCase
) : ViewModel() {
    private val _state = MutableStateFlow(ItemListState())
    val state: StateFlow<ItemListState> = _state.asStateFlow()

    fun onSearch(query: String) {
        _state.update { it.copy(searchQuery = query) }
        loadItems(query)
    }

    private fun loadItems(query: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            getItems(query).fold(
                onSuccess = { items -> _state.update { it.copy(items = items, isLoading = false) } },
                onFailure = { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
            )
        }
    }
}
```

### Compose에서 상태 수집

```kotlin
@Composable
fun ItemListScreen(viewModel: ItemListViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    ItemListContent(
        state = state,
        onSearch = viewModel::onSearch
    )
}

@Composable
private fun ItemListContent(
    state: ItemListState,
    onSearch: (String) -> Unit
) {
    // Stateless composable — easy to preview and test
}
```

### 이벤트 싱크 패턴

복잡한 화면에서는 여러 콜백 람다 대신 sealed interface로 이벤트를 정의하세요.

```kotlin
sealed interface ItemListEvent {
    data class Search(val query: String) : ItemListEvent
    data class Delete(val itemId: String) : ItemListEvent
    data object Refresh : ItemListEvent
}

// In ViewModel
fun onEvent(event: ItemListEvent) {
    when (event) {
        is ItemListEvent.Search -> onSearch(event.query)
        is ItemListEvent.Delete -> deleteItem(event.itemId)
        is ItemListEvent.Refresh -> loadItems(_state.value.searchQuery)
    }
}

// In Composable — single lambda instead of many
ItemListContent(
    state = state,
    onEvent = viewModel::onEvent
)
```

## 네비게이션

### 타입 안전 네비게이션 (Compose Navigation 2.8+)

라우트를 `@Serializable` 객체로 정의하세요.

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val id: String)
@Serializable data object SettingsRoute

@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = HomeRoute) {
        composable<HomeRoute> {
            HomeScreen(onNavigateToDetail = { id -> navController.navigate(DetailRoute(id)) })
        }
        composable<DetailRoute> { backStackEntry ->
            val route = backStackEntry.toRoute<DetailRoute>()
            DetailScreen(id = route.id)
        }
        composable<SettingsRoute> { SettingsScreen() }
    }
}
```

### 다이얼로그와 바텀 시트 네비게이션

명령형 show/hide 대신 `dialog()`와 오버레이 패턴을 사용하세요.

```kotlin
NavHost(navController, startDestination = HomeRoute) {
    composable<HomeRoute> { /* ... */ }
    dialog<ConfirmDeleteRoute> { backStackEntry ->
        val route = backStackEntry.toRoute<ConfirmDeleteRoute>()
        ConfirmDeleteDialog(
            itemId = route.itemId,
            onConfirm = { navController.popBackStack() },
            onDismiss = { navController.popBackStack() }
        )
    }
}
```

## 컴포저블 설계

### 슬롯 기반 API

유연성을 위해 슬롯 파라미터로 컴포저블을 설계하세요.

```kotlin
@Composable
fun AppCard(
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = {},
    content: @Composable ColumnScope.() -> Unit,
    actions: @Composable RowScope.() -> Unit = {}
) {
    Card(modifier = modifier) {
        Column {
            header()
            Column(content = content)
            Row(horizontalArrangement = Arrangement.End, content = actions)
        }
    }
}
```

### Modifier 순서

Modifier의 순서가 중요합니다. 다음 순서로 적용하세요.

```kotlin
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)          // 1. Layout (padding, size)
        .clip(RoundedCornerShape(8.dp))  // 2. Shape
        .background(Color.White) // 3. Drawing (background, border)
        .clickable { }           // 4. Interaction
)
```

## KMP 플랫폼별 UI

### 플랫폼 컴포저블을 위한 expect/actual

```kotlin
// commonMain
@Composable
expect fun PlatformStatusBar(darkIcons: Boolean)

// androidMain
@Composable
actual fun PlatformStatusBar(darkIcons: Boolean) {
    val systemUiController = rememberSystemUiController()
    SideEffect { systemUiController.setStatusBarColor(Color.Transparent, darkIcons) }
}

// iosMain
@Composable
actual fun PlatformStatusBar(darkIcons: Boolean) {
    // iOS handles this via UIKit interop or Info.plist
}
```

## 성능

### 건너뛸 수 있는 리컴포지션을 위한 안정 타입

모든 프로퍼티가 안정적일 때 클래스를 `@Stable` 또는 `@Immutable`로 표시하세요.

```kotlin
@Immutable
data class ItemUiModel(
    val id: String,
    val title: String,
    val description: String,
    val progress: Float
)
```

### `key()`와 Lazy 리스트를 올바르게 사용하기

```kotlin
LazyColumn {
    items(
        items = items,
        key = { it.id }  // Stable keys enable item reuse and animations
    ) { item ->
        ItemRow(item = item)
    }
}
```

### `derivedStateOf`로 읽기 지연하기

```kotlin
val listState = rememberLazyListState()
val showScrollToTop by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 5 }
}
```

### 리컴포지션 중 할당 피하기

```kotlin
// BAD — new lambda and list every recomposition
items.filter { it.isActive }.forEach { ActiveItem(it, onClick = { handle(it) }) }

// GOOD — key each item so callbacks stay attached to the right row
val activeItems = remember(items) { items.filter { it.isActive } }
activeItems.forEach { item ->
    key(item.id) {
        ActiveItem(item, onClick = { handle(item) })
    }
}
```

## 테마

### Material 3 동적 테마

```kotlin
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(LocalContext.current)
            else dynamicLightColorScheme(LocalContext.current)
        }
        darkTheme -> darkColorScheme()
        else -> lightColorScheme()
    }

    MaterialTheme(colorScheme = colorScheme, content = content)
}
```

## 피해야 할 안티패턴

- 생명주기 측면에서 더 안전한 `MutableStateFlow`와 `collectAsStateWithLifecycle`이 있는데도 ViewModel에서 `mutableStateOf`를 사용하는 것
- `NavController`를 컴포저블 깊숙이 전달하는 것 — 대신 람다 콜백을 전달하세요
- `@Composable` 함수 안에서 무거운 계산을 하는 것 — ViewModel이나 `remember {}`로 옮기세요
- ViewModel 초기화 대신 `LaunchedEffect(Unit)`을 사용하는 것 — 일부 구성에서는 구성 변경 시 다시 실행됩니다
- 컴포저블 파라미터에서 새 객체 인스턴스를 만드는 것 — 불필요한 리컴포지션을 일으킵니다

## 참고

모듈 구조와 계층 분리는 `android-clean-architecture` 스킬을 참고하세요.
코루틴과 Flow 패턴은 `kotlin-coroutines-flows` 스킬을 참고하세요.
