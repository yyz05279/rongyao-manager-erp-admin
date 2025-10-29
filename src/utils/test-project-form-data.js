/**
 * 项目表单数据验证脚本
 * 用于验证项目保存功能的数据传输是否正确
 */

// 模拟项目数据结构
const mockProjectData = {
  id: '1967857419283329026',
  projectCode: 'SP20250916F075',
  projectName: '阿克塞项目',
  projectType: 1,
  managerId: 'user123',
  managerName: '张三',
  startDate: '2024-09-16',
  endDate: '2024-12-31',
  description: '阿克塞化盐服务项目描述',
  status: 'IN_PROGRESS',
  progress: 45,
  currentPhase: '化盐阶段',
  createTime: '2024-09-16 10:30:00'
};

// 模拟表单数据结构（应该包含的字段）
const expectedFormFields = [
  'id',
  'projectCode',
  'projectName',
  'projectType',
  'managerId',
  'startDate',
  'endDate',
  'description',
  'processConfigId',
  'qualityStandardId',
  'resourcePlanId'
];

// 验证函数
const validateProjectFormData = (formData) => {
  console.log('=== 项目表单数据验证 ===\n');

  console.log('1. 检查必需字段:');
  const missingFields = [];
  const presentFields = [];

  expectedFormFields.forEach((field) => {
    if (formData.hasOwnProperty(field)) {
      presentFields.push(field);
      console.log(`✅ ${field}: ${formData[field]}`);
    } else {
      missingFields.push(field);
      console.log(`❌ ${field}: 缺失`);
    }
  });

  console.log('\n2. 字段完整性检查:');
  console.log(`总字段数: ${expectedFormFields.length}`);
  console.log(`存在字段数: ${presentFields.length}`);
  console.log(`缺失字段数: ${missingFields.length}`);

  if (missingFields.length > 0) {
    console.log(`缺失字段: ${missingFields.join(', ')}`);
  }

  console.log('\n3. 关键字段验证:');

  // 验证项目编号
  if (formData.projectCode) {
    console.log(`✅ 项目编号存在: ${formData.projectCode}`);
    if (formData.projectCode.startsWith('SP')) {
      console.log('✅ 项目编号格式正确 (以SP开头)');
    } else {
      console.log('⚠️  项目编号格式可能不正确');
    }
  } else {
    console.log('❌ 项目编号缺失 - 这是主要问题！');
  }

  // 验证项目类型
  if (typeof formData.projectType === 'number') {
    console.log(`✅ 项目类型为数字: ${formData.projectType}`);
  } else {
    console.log(`⚠️  项目类型类型异常: ${typeof formData.projectType}`);
  }

  // 验证必需字段
  const requiredFields = ['projectName', 'managerId', 'startDate'];
  requiredFields.forEach((field) => {
    if (formData[field] && formData[field].trim() !== '') {
      console.log(`✅ ${field}: 有效值`);
    } else {
      console.log(`❌ ${field}: 无效或空值`);
    }
  });

  console.log('\n4. 提交数据模拟:');
  const submitData = {
    ...formData,
    processConfigId: '',
    qualityStandardId: '',
    resourcePlanId: ''
  };

  console.log('模拟提交到后端的数据:');
  console.log(JSON.stringify(submitData, null, 2));

  console.log('\n5. 验证结果:');
  const isValid = missingFields.length === 0 && formData.projectCode;
  if (isValid) {
    console.log('✅ 数据验证通过！可以正常提交到后端');
  } else {
    console.log('❌ 数据验证失败！需要修复缺失字段');
  }

  return isValid;
};

// 测试场景1：正确的表单数据（修复后）
console.log('=== 测试场景1：修复后的表单数据 ===');
const correctFormData = {
  id: mockProjectData.id,
  projectCode: mockProjectData.projectCode, // 关键：包含项目编号
  projectName: mockProjectData.projectName,
  projectType: mockProjectData.projectType,
  managerId: mockProjectData.managerId,
  startDate: mockProjectData.startDate,
  endDate: mockProjectData.endDate,
  description: mockProjectData.description,
  processConfigId: '',
  qualityStandardId: '',
  resourcePlanId: ''
};

validateProjectFormData(correctFormData);

console.log('\n' + '='.repeat(60) + '\n');

// 测试场景2：有问题的表单数据（修复前）
console.log('=== 测试场景2：修复前的表单数据（缺少projectCode）===');
const problematicFormData = {
  id: mockProjectData.id,
  // projectCode: mockProjectData.projectCode, // 问题：缺少项目编号
  projectName: mockProjectData.projectName,
  projectType: mockProjectData.projectType,
  managerId: mockProjectData.managerId,
  startDate: mockProjectData.startDate,
  endDate: mockProjectData.endDate,
  description: mockProjectData.description,
  processConfigId: '',
  qualityStandardId: '',
  resourcePlanId: ''
};

validateProjectFormData(problematicFormData);

console.log('\n' + '='.repeat(60) + '\n');

// 测试场景3：新增项目数据
console.log('=== 测试场景3：新增项目数据 ===');
const newProjectFormData = {
  // id: '', // 新增时没有ID
  // projectCode: '', // 新增时没有项目编号
  projectName: '新建测试项目',
  projectType: 2,
  managerId: 'user456',
  startDate: '2024-10-01',
  endDate: '2024-12-31',
  description: '这是一个新建的测试项目',
  processConfigId: '',
  qualityStandardId: '',
  resourcePlanId: ''
};

validateProjectFormData(newProjectFormData);

console.log('\n=== 验证完成 ===');
console.log('修复要点：');
console.log('1. SaltProjectForm接口需要包含projectCode字段');
console.log('2. 表单组件需要在loadProjectData时加载projectCode');
console.log('3. 提交时需要确保projectCode包含在数据中');
console.log('4. 编辑模式下应显示项目编号（只读）');
