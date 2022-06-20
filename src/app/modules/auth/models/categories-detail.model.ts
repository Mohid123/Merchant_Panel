export interface CategoryDetailResponse {
  totalCount: number;
  data:       CategoryDetail[];
}

export interface CategoryDetail {
  categoryName:  string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  _id:             string;
  subCategoryName: string;
}
