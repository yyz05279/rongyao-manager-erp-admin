export interface ProductCategoryVO {
  /**
   * 分类编号
   */
  id: string | number;

  /**
   * 父分类编号
   */
  parentId: string | number;

  /**
   * 分类名称
   */
  name: string;

  /**
   * 分类编码
   */
  code: string;

  /**
   * 分类排序
   */
  sort: number;

  /**
   * 开启状态
   */
  status: number;

    /**
     * 子对象
     */
    children: ProductCategoryVO[];
}

export interface ProductCategoryForm extends BaseEntity {
  /**
   * 分类编号
   */
  id?: string | number;

  /**
   * 父分类编号
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 分类排序
   */
  sort?: number;

  /**
   * 开启状态
   */
  status?: number;

}

export interface ProductCategoryQuery {

  /**
   * 父分类编号
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 开启状态
   */
  status?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



