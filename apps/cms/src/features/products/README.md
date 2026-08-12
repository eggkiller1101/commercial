# Products Data Interface

页面不要直接读取数据库。产品相关读取统一走 `data.ts`：

- `getProducts({ page, pageSize })`: 产品列表分页读取。
- `getProductById(productId)`: 产品编辑页按 id 读取详情。

当前实现只读取 Supabase 数据库，不再回退到本地演示数据。
