/**
 * 发货清单管理模块 - Mock数据
 */
import {
  ShippingListVO,
  ShippingItemVO,
  ShippingStatistics,
  ShippingTrackingRecord,
  ShippingAttachment,
  ShippingStatus,
  EquipmentType,
  ShippingMethod
} from './types';

// 项目基础数据
export const mockProjects = [
  { id: 'P001', name: '淮安化盐项目' },
  { id: 'P002', name: '苏州化盐项目' },
  { id: 'P003', name: '南京化盐项目' },
  { id: 'P004', name: '无锡化盐项目' },
  { id: 'P005', name: '常州化盐项目' }
];

// 负责人基础数据
export const mockUsers = [
  { id: 'U001', name: '张三' },
  { id: 'U002', name: '李四' },
  { id: 'U003', name: '王五' },
  { id: 'U004', name: '赵六' },
  { id: 'U005', name: '钱七' },
  { id: 'U006', name: '孙八' }
];

// 制造商数据
export const mockManufacturers = [
  '上海水泵厂', '北京机械厂', '天津电控设备有限公司', 
  '苏州管道制造厂', '无锡燃烧器厂', '南京标准件厂',
  '杭州精密机械', '青岛重工', '大连船舶重工'
];

// 生成随机日期
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// 生成随机时间戳
const getRandomDateTime = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// 发货清单主表Mock数据
export const mockShippingLists: ShippingListVO[] = [
  {
    id: 'SL001',
    listCode: 'SL202403001',
    projectId: 'P001',
    projectName: '淮安化盐项目',
    batchNumber: '第一车',
    responsiblePerson: '张三',
    responsiblePersonId: 'U001',
    shippingDate: '2024-03-15',
    expectedDeliveryDate: '2024-03-18',
    actualDeliveryDate: '2024-03-17',
    status: ShippingStatus.DELIVERED,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏A12345',
    driverInfo: '李师傅 13800138001',
    totalItems: 25,
    totalWeight: 1500.5,
    totalVolume: 12.8,
    packingListPath: '/uploads/packing/SL202403001.pdf',
    photoPath: '/uploads/photos/SL202403001.jpg',
    remarks: '机械设备第一批发货，注意轻拿轻放',
    createTime: '2024-03-15T08:30:00Z',
    updateTime: '2024-03-17T16:45:00Z',
    createBy: 'admin',
    updateBy: 'admin'
  },
  {
    id: 'SL002',
    listCode: 'SL202403002',
    projectId: 'P001',
    projectName: '淮安化盐项目',
    batchNumber: '第二车',
    responsiblePerson: '李四',
    responsiblePersonId: 'U002',
    shippingDate: '2024-03-20',
    expectedDeliveryDate: '2024-03-23',
    status: ShippingStatus.SHIPPED,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏B67890',
    driverInfo: '王师傅 13800138002',
    totalItems: 18,
    totalWeight: 2200.8,
    totalVolume: 15.6,
    packingListPath: '/uploads/packing/SL202403002.pdf',
    remarks: '电控设备发货，防潮防震',
    createTime: '2024-03-20T09:15:00Z',
    updateTime: '2024-03-20T14:20:00Z',
    createBy: 'admin',
    updateBy: 'user002'
  },
  {
    id: 'SL003',
    listCode: 'SL202403003',
    projectId: 'P002',
    projectName: '苏州化盐项目',
    batchNumber: '第一车',
    responsiblePerson: '王五',
    responsiblePersonId: 'U003',
    shippingDate: '2024-03-25',
    expectedDeliveryDate: '2024-03-28',
    status: ShippingStatus.PENDING,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏C11111',
    driverInfo: '赵师傅 13800138003',
    totalItems: 32,
    totalWeight: 1800.3,
    totalVolume: 18.2,
    remarks: '管路设备批次，包含大型管件',
    createTime: '2024-03-25T10:00:00Z',
    updateTime: '2024-03-25T10:00:00Z',
    createBy: 'user003',
    updateBy: 'user003'
  },
  {
    id: 'SL004',
    listCode: 'SL202403004',
    projectId: 'P001',
    projectName: '淮安化盐项目',
    batchNumber: '第三车',
    responsiblePerson: '赵六',
    responsiblePersonId: 'U004',
    shippingDate: '2024-03-28',
    expectedDeliveryDate: '2024-03-31',
    status: ShippingStatus.DRAFT,
    shippingMethod: ShippingMethod.TRUCK,
    totalItems: 0,
    totalWeight: 0,
    totalVolume: 0,
    remarks: '燃烧器设备准备中',
    createTime: '2024-03-28T11:30:00Z',
    updateTime: '2024-03-28T11:30:00Z',
    createBy: 'user004',
    updateBy: 'user004'
  },
  {
    id: 'SL005',
    listCode: 'SL202403005',
    projectId: 'P003',
    projectName: '南京化盐项目',
    batchNumber: '第一车',
    responsiblePerson: '钱七',
    responsiblePersonId: 'U005',
    shippingDate: '2024-04-02',
    expectedDeliveryDate: '2024-04-05',
    status: ShippingStatus.COMPLETED,
    shippingMethod: ShippingMethod.RAIL,
    vehicleInfo: '铁路专用车厢 T001',
    driverInfo: '铁路运输',
    totalItems: 45,
    totalWeight: 3500.2,
    totalVolume: 28.5,
    packingListPath: '/uploads/packing/SL202403005.pdf',
    photoPath: '/uploads/photos/SL202403005.jpg',
    actualDeliveryDate: '2024-04-04',
    remarks: '大型设备铁路运输，已完成验收',
    createTime: '2024-04-02T08:00:00Z',
    updateTime: '2024-04-04T17:30:00Z',
    createBy: 'user005',
    updateBy: 'user005'
  },
  {
    id: 'SL006',
    listCode: 'SL202403006',
    projectId: 'P002',
    projectName: '苏州化盐项目',
    batchNumber: '第二车',
    responsiblePerson: '孙八',
    responsiblePersonId: 'U006',
    shippingDate: '2024-04-08',
    expectedDeliveryDate: '2024-04-11',
    status: ShippingStatus.PARTIAL_SHIPPED,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏D22222',
    driverInfo: '刘师傅 13800138006',
    totalItems: 28,
    totalWeight: 2100.7,
    totalVolume: 16.8,
    remarks: '部分设备已发货，剩余设备待发',
    createTime: '2024-04-08T09:45:00Z',
    updateTime: '2024-04-08T15:20:00Z',
    createBy: 'user006',
    updateBy: 'user006'
  },
  {
    id: 'SL007',
    listCode: 'SL202403007',
    projectId: 'P004',
    projectName: '无锡化盐项目',
    batchNumber: '第一车',
    responsiblePerson: '张三',
    responsiblePersonId: 'U001',
    shippingDate: '2024-04-12',
    expectedDeliveryDate: '2024-04-15',
    status: ShippingStatus.CANCELLED,
    shippingMethod: ShippingMethod.TRUCK,
    totalItems: 0,
    totalWeight: 0,
    remarks: '客户要求延期，清单已取消',
    createTime: '2024-04-12T10:15:00Z',
    updateTime: '2024-04-12T14:30:00Z',
    createBy: 'admin',
    updateBy: 'admin'
  },
  {
    id: 'SL008',
    listCode: 'SL202403008',
    projectId: 'P005',
    projectName: '常州化盐项目',
    batchNumber: '第一车',
    responsiblePerson: '李四',
    responsiblePersonId: 'U002',
    shippingDate: '2024-04-18',
    expectedDeliveryDate: '2024-04-21',
    status: ShippingStatus.PENDING,
    shippingMethod: ShippingMethod.SEA,
    vehicleInfo: '海运集装箱 C001',
    driverInfo: '海运物流',
    totalItems: 60,
    totalWeight: 4200.5,
    totalVolume: 35.2,
    remarks: '海运出口设备，需要报关手续',
    createTime: '2024-04-18T08:30:00Z',
    updateTime: '2024-04-18T08:30:00Z',
    createBy: 'user002',
    updateBy: 'user002'
  },
  {
    id: 'SL009',
    listCode: 'SL202403009',
    projectId: 'P001',
    projectName: '淮安化盐项目',
    batchNumber: '第四车',
    responsiblePerson: '王五',
    responsiblePersonId: 'U003',
    shippingDate: '2024-04-22',
    expectedDeliveryDate: '2024-04-25',
    status: ShippingStatus.SHIPPED,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏E33333',
    driverInfo: '陈师傅 13800138009',
    totalItems: 22,
    totalWeight: 1650.8,
    totalVolume: 13.5,
    packingListPath: '/uploads/packing/SL202403009.pdf',
    remarks: '辅助设备和标准件发货',
    createTime: '2024-04-22T09:00:00Z',
    updateTime: '2024-04-22T13:45:00Z',
    createBy: 'user003',
    updateBy: 'user003'
  },
  {
    id: 'SL010',
    listCode: 'SL202403010',
    projectId: 'P003',
    projectName: '南京化盐项目',
    batchNumber: '第二车',
    responsiblePerson: '赵六',
    responsiblePersonId: 'U004',
    shippingDate: '2024-04-25',
    expectedDeliveryDate: '2024-04-28',
    status: ShippingStatus.DELIVERED,
    shippingMethod: ShippingMethod.TRUCK,
    vehicleInfo: '苏F44444',
    driverInfo: '周师傅 13800138010',
    totalItems: 35,
    totalWeight: 2800.3,
    totalVolume: 22.1,
    actualDeliveryDate: '2024-04-27',
    packingListPath: '/uploads/packing/SL202403010.pdf',
    photoPath: '/uploads/photos/SL202403010.jpg',
    remarks: '精密设备发货，客户已签收',
    createTime: '2024-04-25T08:15:00Z',
    updateTime: '2024-04-27T16:20:00Z',
    createBy: 'user004',
    updateBy: 'user004'
  }
];

// 发货清单明细Mock数据生成函数
const generateShippingItems = (shippingListId: string, equipmentTypes: EquipmentType[], count: number): ShippingItemVO[] => {
  const items: ShippingItemVO[] = [];
  const itemNames = {
    [EquipmentType.MECHANICAL]: ['离心泵', '螺杆泵', '搅拌器', '减速机', '电机', '联轴器', '轴承', '密封件'],
    [EquipmentType.ELECTRICAL]: ['变频器', '控制柜', '配电箱', '传感器', '电缆', '接触器', '继电器', '开关'],
    [EquipmentType.PIPELINE]: ['不锈钢管', '法兰', '弯头', '三通', '阀门', '管件', '支架', '保温材料'],
    [EquipmentType.BURNER]: ['燃烧器', '点火器', '火焰检测器', '燃气阀', '风机', '燃烧室', '烟道', '安全阀'],
    [EquipmentType.AUXILIARY]: ['仪表', '温度计', '压力表', '流量计', '液位计', '安全设备', '工具', '备件'],
    [EquipmentType.STANDARD_PARTS]: ['螺栓', '螺母', '垫片', '销钉', '键', '弹簧', '紧固件', '标准件']
  };

  for (let i = 0; i < count; i++) {
    const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    const itemNameList = itemNames[equipmentType];
    const itemName = itemNameList[Math.floor(Math.random() * itemNameList.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const unitWeight = Math.random() * 100 + 10;
    const manufacturer = mockManufacturers[Math.floor(Math.random() * mockManufacturers.length)];

    items.push({
      id: `I${shippingListId.slice(-3)}${String(i + 1).padStart(3, '0')}`,
      shippingListId,
      itemCode: `${equipmentType.slice(0, 3)}${String(i + 1).padStart(4, '0')}`,
      itemName,
      specification: `${itemName}-${Math.floor(Math.random() * 1000) + 100}`,
      equipmentType,
      quantity,
      unit: ['台', '个', '套', '米', '公斤'][Math.floor(Math.random() * 5)],
      unitWeight: Math.round(unitWeight * 100) / 100,
      totalWeight: Math.round(unitWeight * quantity * 100) / 100,
      unitVolume: Math.round(unitWeight * 0.01 * 100) / 100,
      totalVolume: Math.round(unitWeight * 0.01 * quantity * 100) / 100,
      manufacturer,
      model: `${itemName.slice(0, 2)}${Math.floor(Math.random() * 1000) + 100}`,
      serialNumber: `SN${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      packageType: ['木箱', '纸箱', '托盘', '裸装'][Math.floor(Math.random() * 4)],
      packageQuantity: Math.ceil(quantity / 2),
      isFragile: Math.random() > 0.7,
      isHazardous: Math.random() > 0.9,
      storageRequirement: ['常温干燥', '防潮防震', '避光保存', '低温存储'][Math.floor(Math.random() * 4)],
      remarks: Math.random() > 0.5 ? '新设备' : '备用设备',
      createTime: getRandomDateTime(new Date('2024-03-01'), new Date('2024-04-30')),
      updateTime: getRandomDateTime(new Date('2024-03-01'), new Date('2024-04-30'))
    });
  }

  return items;
};

// 发货清单明细数据
export const mockShippingItems: ShippingItemVO[] = [
  ...generateShippingItems('SL001', [EquipmentType.MECHANICAL], 25),
  ...generateShippingItems('SL002', [EquipmentType.ELECTRICAL], 18),
  ...generateShippingItems('SL003', [EquipmentType.PIPELINE], 32),
  ...generateShippingItems('SL004', [EquipmentType.BURNER], 0), // 草稿状态，无明细
  ...generateShippingItems('SL005', [EquipmentType.MECHANICAL, EquipmentType.ELECTRICAL], 45),
  ...generateShippingItems('SL006', [EquipmentType.PIPELINE, EquipmentType.AUXILIARY], 28),
  ...generateShippingItems('SL007', [EquipmentType.STANDARD_PARTS], 0), // 已取消，无明细
  ...generateShippingItems('SL008', [EquipmentType.MECHANICAL, EquipmentType.ELECTRICAL, EquipmentType.PIPELINE], 60),
  ...generateShippingItems('SL009', [EquipmentType.AUXILIARY, EquipmentType.STANDARD_PARTS], 22),
  ...generateShippingItems('SL010', [EquipmentType.MECHANICAL, EquipmentType.BURNER], 35)
];

// 统计数据
export const mockShippingStatistics: ShippingStatistics = {
  totalLists: 10,
  totalItems: 265,
  totalWeight: 20451.9,
  totalVolume: 162.7,
  statusCounts: {
    [ShippingStatus.DRAFT]: 1,
    [ShippingStatus.PENDING]: 2,
    [ShippingStatus.PARTIAL_SHIPPED]: 1,
    [ShippingStatus.SHIPPED]: 2,
    [ShippingStatus.DELIVERED]: 2,
    [ShippingStatus.COMPLETED]: 1,
    [ShippingStatus.CANCELLED]: 1
  },
  equipmentTypeCounts: {
    [EquipmentType.MECHANICAL]: 85,
    [EquipmentType.ELECTRICAL]: 65,
    [EquipmentType.PIPELINE]: 75,
    [EquipmentType.BURNER]: 15,
    [EquipmentType.AUXILIARY]: 15,
    [EquipmentType.STANDARD_PARTS]: 10
  },
  monthlyShippingTrend: [
    { month: '2024-01', count: 2, weight: 3200.5 },
    { month: '2024-02', count: 3, weight: 4800.8 },
    { month: '2024-03', count: 4, weight: 6500.2 },
    { month: '2024-04', count: 1, weight: 5951.4 }
  ]
};

// 跟踪记录数据生成函数
const generateTrackingRecords = (shippingListId: string, status: ShippingStatus): ShippingTrackingRecord[] => {
  const records: ShippingTrackingRecord[] = [];
  const baseDate = new Date('2024-03-15');
  let currentDate = new Date(baseDate);

  // 根据状态生成相应的跟踪记录
  const statusFlow = [
    ShippingStatus.DRAFT,
    ShippingStatus.PENDING,
    ShippingStatus.SHIPPED,
    ShippingStatus.DELIVERED,
    ShippingStatus.COMPLETED
  ];

  const statusIndex = statusFlow.indexOf(status);
  const recordsToGenerate = status === ShippingStatus.CANCELLED ? 2 : Math.min(statusIndex + 1, statusFlow.length);

  for (let i = 0; i < recordsToGenerate; i++) {
    const recordStatus = status === ShippingStatus.CANCELLED && i === recordsToGenerate - 1
      ? ShippingStatus.CANCELLED
      : statusFlow[i];

    currentDate = new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);

    records.push({
      id: `T${shippingListId.slice(-3)}${String(i + 1).padStart(3, '0')}`,
      shippingListId,
      status: recordStatus,
      statusTime: currentDate.toISOString(),
      location: ['上海仓库', '运输途中', '客户现场', '项目现场'][i] || '其他地点',
      operator: mockUsers[Math.floor(Math.random() * mockUsers.length)].name,
      operatorId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
      remarks: getStatusRemarks(recordStatus),
      createTime: currentDate.toISOString()
    });
  }

  return records;
};

const getStatusRemarks = (status: ShippingStatus): string => {
  const remarks = {
    [ShippingStatus.DRAFT]: '清单创建完成，等待审核',
    [ShippingStatus.PENDING]: '审核通过，准备发货',
    [ShippingStatus.SHIPPED]: '货物已发出，运输中',
    [ShippingStatus.DELIVERED]: '货物已送达，等待验收',
    [ShippingStatus.COMPLETED]: '验收完成，项目结束',
    [ShippingStatus.CANCELLED]: '订单已取消',
    [ShippingStatus.PARTIAL_SHIPPED]: '部分货物已发出'
  };
  return remarks[status] || '状态更新';
};

// 跟踪记录数据
export const mockTrackingRecords: ShippingTrackingRecord[] = [
  ...generateTrackingRecords('SL001', ShippingStatus.DELIVERED),
  ...generateTrackingRecords('SL002', ShippingStatus.SHIPPED),
  ...generateTrackingRecords('SL003', ShippingStatus.PENDING),
  ...generateTrackingRecords('SL004', ShippingStatus.DRAFT),
  ...generateTrackingRecords('SL005', ShippingStatus.COMPLETED),
  ...generateTrackingRecords('SL006', ShippingStatus.PARTIAL_SHIPPED),
  ...generateTrackingRecords('SL007', ShippingStatus.CANCELLED),
  ...generateTrackingRecords('SL008', ShippingStatus.PENDING),
  ...generateTrackingRecords('SL009', ShippingStatus.SHIPPED),
  ...generateTrackingRecords('SL010', ShippingStatus.DELIVERED)
];

// 附件数据
export const mockAttachments: ShippingAttachment[] = [
  {
    id: 'A001',
    shippingListId: 'SL001',
    fileName: '淮安项目第一车装箱清单.pdf',
    filePath: '/uploads/attachments/2024/03/15/packing_list_001.pdf',
    fileSize: 2048576,
    fileType: 'application/pdf',
    attachmentType: 'PACKING_LIST',
    uploadTime: '2024-03-15T09:00:00Z',
    uploadBy: 'admin'
  },
  {
    id: 'A002',
    shippingListId: 'SL001',
    fileName: '发货现场照片1.jpg',
    filePath: '/uploads/attachments/2024/03/15/shipping_photo_001.jpg',
    fileSize: 1024768,
    fileType: 'image/jpeg',
    attachmentType: 'PHOTO',
    uploadTime: '2024-03-15T10:30:00Z',
    uploadBy: 'admin'
  },
  {
    id: 'A003',
    shippingListId: 'SL002',
    fileName: '电控设备装箱清单.pdf',
    filePath: '/uploads/attachments/2024/03/20/packing_list_002.pdf',
    fileSize: 1536000,
    fileType: 'application/pdf',
    attachmentType: 'PACKING_LIST',
    uploadTime: '2024-03-20T11:15:00Z',
    uploadBy: 'user002'
  },
  {
    id: 'A004',
    shippingListId: 'SL005',
    fileName: '质量检验报告.pdf',
    filePath: '/uploads/attachments/2024/04/02/quality_report_005.pdf',
    fileSize: 3072000,
    fileType: 'application/pdf',
    attachmentType: 'DOCUMENT',
    uploadTime: '2024-04-02T14:20:00Z',
    uploadBy: 'user005'
  },
  {
    id: 'A005',
    shippingListId: 'SL005',
    fileName: '铁路运输照片.jpg',
    filePath: '/uploads/attachments/2024/04/02/rail_transport_005.jpg',
    fileSize: 2048000,
    fileType: 'image/jpeg',
    attachmentType: 'PHOTO',
    uploadTime: '2024-04-02T16:45:00Z',
    uploadBy: 'user005'
  },
  {
    id: 'A006',
    shippingListId: 'SL010',
    fileName: '客户签收单.pdf',
    filePath: '/uploads/attachments/2024/04/27/receipt_010.pdf',
    fileSize: 512000,
    fileType: 'application/pdf',
    attachmentType: 'DOCUMENT',
    uploadTime: '2024-04-27T17:00:00Z',
    uploadBy: 'user004'
  }
];

// 根据发货清单ID获取明细数据
export const getShippingItemsByListId = (shippingListId: string): ShippingItemVO[] => {
  return mockShippingItems.filter(item => item.shippingListId === shippingListId);
};

// 根据发货清单ID获取跟踪记录
export const getTrackingRecordsByListId = (shippingListId: string): ShippingTrackingRecord[] => {
  return mockTrackingRecords.filter(record => record.shippingListId === shippingListId);
};

// 根据发货清单ID获取附件数据
export const getAttachmentsByListId = (shippingListId: string): ShippingAttachment[] => {
  return mockAttachments.filter(attachment => attachment.shippingListId === shippingListId);
};

// 根据查询条件过滤发货清单
export const filterShippingLists = (query: any): ShippingListVO[] => {
  let filteredLists = [...mockShippingLists];

  if (query.projectId) {
    filteredLists = filteredLists.filter(list => list.projectId === query.projectId);
  }

  if (query.projectName) {
    filteredLists = filteredLists.filter(list =>
      list.projectName.toLowerCase().includes(query.projectName.toLowerCase())
    );
  }

  if (query.listCode) {
    filteredLists = filteredLists.filter(list =>
      list.listCode.toLowerCase().includes(query.listCode.toLowerCase())
    );
  }

  if (query.batchNumber) {
    filteredLists = filteredLists.filter(list =>
      list.batchNumber.toLowerCase().includes(query.batchNumber.toLowerCase())
    );
  }

  if (query.responsiblePerson) {
    filteredLists = filteredLists.filter(list =>
      list.responsiblePerson.toLowerCase().includes(query.responsiblePerson.toLowerCase())
    );
  }

  if (query.status) {
    filteredLists = filteredLists.filter(list => list.status === query.status);
  }

  if (query.shippingDateStart) {
    filteredLists = filteredLists.filter(list => list.shippingDate >= query.shippingDateStart);
  }

  if (query.shippingDateEnd) {
    filteredLists = filteredLists.filter(list => list.shippingDate <= query.shippingDateEnd);
  }

  return filteredLists;
};

// 分页处理
export const paginateResults = <T>(data: T[], pageNum: number = 1, pageSize: number = 10) => {
  const total = data.length;
  const pages = Math.ceil(total / pageSize);
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const rows = data.slice(start, end);

  return {
    rows,
    total,
    pageNum,
    pageSize,
    pages
  };
};

// 生成清单编号
export const generateListCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `SL${year}${month}${sequence}`;
};
