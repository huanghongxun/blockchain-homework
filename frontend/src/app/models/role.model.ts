export enum Role {
  Anonymous = 'ROLE_ANONYMOUS',
  Company = 'ROLE_COMPANY',
  Bank = 'ROLE_BANK',
  Government = 'ROLE_GOVERNMENT',
  Admin = 'ROLE_ADMIN'
}

export const ROLES: string[] = [Role.Anonymous, Role.Company, Role.Bank, Role.Government, Role.Admin];

export const ROLE_NAMES = {
  [Role.Anonymous]: '未登录',
  [Role.Company]: '企业',
  [Role.Bank]: '金融机构',
  [Role.Government]: '政府',
  [Role.Admin]: '管理员',
};

/**
 * 角色 a 的权限小于等于角色 b 时返回 true
 */
export type RoleComparator = (a: string | Role, b: string | Role) => boolean;
