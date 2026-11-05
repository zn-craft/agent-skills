# 类型命名与写法

管 TS 类型命名、类型导入导出、类成员修饰符与函数参数写法。类型怎么声明见 [type-modeling.md](type-modeling.md)，边界数据怎么收窄见 [type-safety.md](type-safety.md)。

## 命名

| 对象 | 约定 | 例子 |
| --- | --- | --- |
| 接口、对象契约 | `I` + 大驼峰 | `IUserInfo`、`IRequestOptions`、`IUserCardProps` |
| 枚举 | `E` + 大驼峰 | `EOrderStatus` |
| 枚举成员 | 大驼峰 | `EOrderStatus.Pending` |
| 类型别名、类 | 大驼峰 | `UserInfoMap`、`UserService` |

- 前缀只管对象契约：接口和组件 Props 加 `I`，枚举加 `E`；联合、交叉、工具类型、`keyof` 派生的键名和类不加。
- 生成物不受前缀约束：代码生成器产出的接口、ORM 推导的实体保持原名，改了下次生成会被覆盖。
- 外来类型不为统一前缀改名：别人写的模块、第三方类型、从别的仓库搬来的类型保持原名。
- 用 `as const` 对象代替枚举时，对象名全大写下划线（`ORDER_STATUS`）、成员大驼峰；开了 `erasableSyntaxOnly` 的工程不能用 `enum`，取值集合一律走这种写法。
- 成员私有性用 `private`，不用 `_` 前缀；只有未使用的参数才用 `_` 前缀。

## 类型导入与导出

- 只当类型用的导入写 `import type`，编译后这条语句被删掉，不会把模块拉进运行时依赖。
- 同时要类型和值时才拆成两条，别让类型拖着一个运行时模块一起进来：

```ts
import type { IUserInfo } from "./user.type";
import { fetchUserInfo } from "./user.api";

export type { IUserInfo };
```

- 开了 `verbatimModuleSyntax` 时这是硬要求：类型导入不写 `type` 直接报错，重导出同理。
- 重导出只供类型用的符号用 `export type`。
- 类型文件之间只允许单向依赖，不留未使用的导入，不制造循环依赖。
- 全局增强（`declare global`、模块扩充）只在确实要改第三方类型时写，并在旁边说明原因。

## 类与成员修饰符

- 方法都写访问修饰符，不靠默认 `public`：只在本类用的写 `private`，给子类的写 `protected`，对外 API 才写 `public`；声明了要给子类用的成员就写 `protected`，不写成 `private` 再绕过。
- 初始化后不再改的属性加 `readonly`；不依赖实例状态的写 `static`。
- 子类重写保持父类签名；开了 `noImplicitOverride` 时重写方法写 `override`。
- 抽象成员用 `abstract` 声明，父类调用抽象成员前确认子类一定会实现。

## 函数

- 不改的入参标 `readonly`：`sum(items: readonly number[])`，调用方传 `as const` 数组不会被拒；入参是对象时用 `Readonly<T>`。
- 重载只写调用方真的会用到的签名，能用联合类型或泛型表达就不写重载；实现签名不外露。
