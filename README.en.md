# HaiTang Enterprise Management System

## Project Introduction

HaiTang Enterprise Management System is a modern enterprise-level management platform that focuses on providing efficient, secure, and easy-to-use business management solutions. The system adopts a front-end and back-end separation architecture, supports multi-terminal access, and provides comprehensive digital management services for enterprises.

## Technology Stack

### Frontend Technologies
- **Framework**: Vue 3.4.20
- **Language**: TypeScript 4.9.5
- **UI Components**: Element Plus 2.2.27
- **Build Tool**: Vite 4.3.1
- **State Management**: Pinia 2.0.22
- **Router**: Vue Router 4.1.4
- **HTTP Client**: Axios 1.3.4
- **Charts**: ECharts 5.4.0
- **Internationalization**: Vue I18n 9.2.2

### Core Features
- 🎯 **Modern Architecture**: Based on Vue3 + TypeScript + Vite modern frontend technology stack
- 🔐 **Permission Management**: Complete RBAC permission control system
- 💼 **Financial Management**: Complete financial process management, supporting payment orders, receipt orders, etc.
- 👥 **HR Management**: Employee information management, organizational structure management
- 📊 **Data Analysis**: Multi-dimensional data statistics and visualization
- 🔄 **Workflow**: Flexible business process configuration and approval
- 📱 **Responsive Design**: Support for PC, tablet, mobile and other multi-terminal access
- 🌐 **Internationalization**: Support for multi-language switching

## Functional Modules

### System Management
- User Management: User information maintenance, permission assignment
- Role Management: Role permission configuration, data permission control
- Department Management: Organizational structure hierarchy management
- Menu Management: Dynamic menu permission control
- Dictionary Management: System data dictionary maintenance

### Financial Management
- Payment Management: Payment order creation, approval, execution
- Receipt Management: Receipt order management, reconciliation processing
- Account Management: Settlement account information management
- Financial Reports: Revenue and expenditure statistics, financial analysis

### Business Management
- Customer Management: Centralized customer information management
- Supplier Management: Supplier qualification assessment and management
- Contract Management: Contract full lifecycle management
- Project Management: Real-time project progress monitoring

## Quick Start

### Environment Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0 or yarn >= 1.22.0

### Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Development Environment
```bash
# Start development server
npm run dev

# Or using yarn
yarn dev
```

### Production Build
```bash
# Build for production
npm run build:prod

# Or using yarn
yarn build:prod
```

## Project Structure
```
haitang-web-admin/
├── public/                 # Static assets
├── src/
│   ├── api/               # API interfaces
│   ├── assets/            # Resource files
│   ├── components/        # Common components
│   ├── layout/            # Layout components
│   ├── router/            # Router configuration
│   ├── store/             # State management
│   ├── utils/             # Utility functions
│   ├── views/             # Page components
│   └── main.ts            # Entry file
├── docs/                  # Documentation
└── package.json           # Project configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contact Us

If you have any questions or suggestions, please contact us through:
- Submit an Issue
- Send email to: support@haitang.com

---

© 2024 HaiTang Technology Team. All rights reserved.
