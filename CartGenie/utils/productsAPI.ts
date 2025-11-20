export type ProductFromApi = {
  barcode: string;
  name: string;
};

export async function fetchProductByBarcode(barcode: string): Promise<ProductFromApi> {
  return {
    barcode,
    name: `Product ${barcode}`, // временная заглушка
  };
}
