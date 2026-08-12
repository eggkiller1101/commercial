import { ProductForm } from "@/features/products/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">产品新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          填写产品基础信息并上传产品图片。
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
