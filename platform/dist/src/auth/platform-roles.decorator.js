"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRoles = exports.PLATFORM_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PLATFORM_ROLES_KEY = 'platformRoles';
const PlatformRoles = (...roles) => (0, common_1.SetMetadata)(exports.PLATFORM_ROLES_KEY, roles);
exports.PlatformRoles = PlatformRoles;
//# sourceMappingURL=platform-roles.decorator.js.map