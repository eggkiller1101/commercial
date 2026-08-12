# Inquiries Data Interface

页面和 API 不直接读取数据库。询价相关读取统一走 `data.ts`：

- `getInquiries({ page, pageSize })`: 询价列表分页读取。
- `getInquiryById(inquiryId)`: 询价详情页按 id 读取详情。
- `getInquiryQuoteFile(inquiryId)`: 询价单下载接口读取真实文件内容。

当前实现只读取 Supabase 数据库，不再回退到本地演示数据。
