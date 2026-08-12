# Products Data Interface

页面不要直接读取 mock 数据或数据库。产品相关读取统一走 `data.ts`：

- `getProducts({ page, pageSize })`: 产品列表分页读取。
- `getProductById(productId)`: 产品编辑页按 id 读取详情。

后续接 Supabase 时，替换 `data.ts` 内部实现即可。
