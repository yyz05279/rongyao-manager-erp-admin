/**
 * Material payload helpers
 *
 * 根据《前端编辑物料请求调整指南》统一过滤与构建物料请求体：
 * - 过滤冗余字段：id、projectItemId、projectSubsystemId、projectSystemId、projectId、createTime、updateTime、version
 * - 过滤空值：undefined、null
 * - 单条编辑(PUT)：不携带 id
 * - 批量保存(POST Upsert)：允许携带 id（用于区分新增/更新）
 */

export type AnyRecord = Record<string, any>;

/**
 * 过滤冗余字段与 undefined/null 值（基础过滤）
 */
export const filterMaterialPayloadBase = (raw: AnyRecord): AnyRecord => {
  const redundant = new Set([
    'id',
    'projectItemId',
    'projectSubsystemId',
    'projectSystemId',
    'projectId',
    'createTime',
    'updateTime',
    'version'
  ]);
  const payload: AnyRecord = {};
  Object.keys(raw || {}).forEach((key) => {
    if (redundant.has(key)) return;
    const val = raw[key];
    if (val === undefined || val === null) return; // 过滤 undefined / null
    payload[key] = val;
  });
  return payload;
};

/**
 * 构建单条编辑(PUT)的请求体：不包含 id
 */
export const buildMaterialUpdatePayload = (data: AnyRecord): AnyRecord => {
  return filterMaterialPayloadBase(data);
};

/**
 * 构建批量保存(POST Upsert)的请求体：保留 id（如果存在）
 */
export const buildMaterialUpsertPayload = (data: AnyRecord): AnyRecord => {
  const baseRemoved = filterMaterialPayloadBase(data);
  if (data && data.id !== undefined && data.id !== null) {
    baseRemoved.id = data.id;
  }
  return baseRemoved;
};

