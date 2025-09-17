/**
 * 项目类型转换工具
 * 用于将后端返回的数字类型转换为用户友好的中文描述
 */

// 项目类型映射常量
export const PROJECT_TYPE_MAP = {
  1: "二元化盐项目",
  2: "三元化盐项目", 
  3: "定制项目"
} as const;

// 项目类型数字枚举
export type ProjectTypeNumber = keyof typeof PROJECT_TYPE_MAP;

// 项目类型中文描述
export type ProjectTypeText = typeof PROJECT_TYPE_MAP[ProjectTypeNumber];

// 项目类型标签颜色映射
export const PROJECT_TYPE_TAG_MAP = {
  1: "primary",
  2: "success", 
  3: "warning"
} as const;

/**
 * 将项目类型数字转换为中文描述
 * @param type 项目类型（数字或字符串）
 * @returns 中文描述文本
 */
export const getProjectTypeText = (type: string | number | undefined | null): string => {
  if (type === undefined || type === null) {
    return "未知类型";
  }

  // 处理数字类型
  if (typeof type === 'number') {
    return PROJECT_TYPE_MAP[type as ProjectTypeNumber] || "未知类型";
  }

  // 处理字符串类型（可能是数字字符串）
  if (typeof type === 'string') {
    const numType = parseInt(type, 10);
    if (!isNaN(numType) && numType in PROJECT_TYPE_MAP) {
      return PROJECT_TYPE_MAP[numType as ProjectTypeNumber];
    }
    
    // 处理字符串枚举值（向后兼容）
    const stringToNumberMap: Record<string, ProjectTypeNumber> = {
      'BINARY_SALT': 1,
      'TERNARY_SALT': 2,
      'CUSTOM': 3
    };
    
    const mappedNumber = stringToNumberMap[type];
    if (mappedNumber) {
      return PROJECT_TYPE_MAP[mappedNumber];
    }
  }

  return "未知类型";
};

/**
 * 获取项目类型对应的标签颜色
 * @param type 项目类型（数字或字符串）
 * @returns Element Plus 标签颜色类型
 */
export const getProjectTypeTag = (type: string | number | undefined | null): string => {
  if (type === undefined || type === null) {
    return "";
  }

  // 处理数字类型
  if (typeof type === 'number') {
    return PROJECT_TYPE_TAG_MAP[type as ProjectTypeNumber] || "";
  }

  // 处理字符串类型（可能是数字字符串）
  if (typeof type === 'string') {
    const numType = parseInt(type, 10);
    if (!isNaN(numType) && numType in PROJECT_TYPE_TAG_MAP) {
      return PROJECT_TYPE_TAG_MAP[numType as ProjectTypeNumber];
    }
    
    // 处理字符串枚举值（向后兼容）
    const stringToNumberMap: Record<string, ProjectTypeNumber> = {
      'BINARY_SALT': 1,
      'TERNARY_SALT': 2,
      'CUSTOM': 3
    };
    
    const mappedNumber = stringToNumberMap[type];
    if (mappedNumber) {
      return PROJECT_TYPE_TAG_MAP[mappedNumber];
    }
  }

  return "";
};

/**
 * 验证项目类型是否有效
 * @param type 项目类型
 * @returns 是否为有效的项目类型
 */
export const isValidProjectType = (type: string | number | undefined | null): boolean => {
  if (type === undefined || type === null) {
    return false;
  }

  if (typeof type === 'number') {
    return type in PROJECT_TYPE_MAP;
  }

  if (typeof type === 'string') {
    const numType = parseInt(type, 10);
    if (!isNaN(numType)) {
      return numType in PROJECT_TYPE_MAP;
    }
    
    // 检查字符串枚举值
    const validStringTypes = ['BINARY_SALT', 'TERNARY_SALT', 'CUSTOM'];
    return validStringTypes.includes(type);
  }

  return false;
};

/**
 * 获取所有可用的项目类型选项（用于下拉框等）
 * @returns 项目类型选项数组
 */
export const getProjectTypeOptions = () => {
  return Object.entries(PROJECT_TYPE_MAP).map(([value, label]) => ({
    value: parseInt(value, 10),
    label
  }));
};
