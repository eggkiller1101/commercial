# Inquiries Data Interface

页面和 API 不直接读取 mock 数据或数据库。询价相关读取统一走 `data.ts`：

- `getInquiries({ page, pageSize })`: 询价列表分页读取。
- `getInquiryById(inquiryId)`: 询价详情页按 id 读取详情。
- `getInquiryQuoteCsv(inquiryId)`: 询价单下载接口读取 csv 内容。

后续接 Supabase 时，替换 `data.ts` 内部实现即可。
