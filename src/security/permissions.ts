export const getPermissions = (role: string) => {
  const id = null;

  const createPermissions = ['list', 'read', 'show', 'create', 'export'];
  const updatePermissions = createPermissions.concat('edit');

  const roleDefinitions = {
    MANAGER: [
      { action: 'read', resource: 'profile', record: { id: id } },
      { action: updatePermissions, resource: 'students' },
      { action: updatePermissions, resource: 'teachers' },

      { action: createPermissions, resource: 'fees' },
      { action: createPermissions, resource: 'payments' },
    ],

    TEACHER: [
      { action: 'read', resource: 'profile', record: { id: id } },
      { action: ['list', 'read', 'show'], resource: 'students' },
    ],

    STUDENT: [
      { action: 'read', resource: 'profile', record: { id: id } },

      { action: ['list', 'read', 'show'], resource: 'fees' },
      { action: ['list', 'read', 'show'], resource: 'payments' },
    ],
  };
  return roleDefinitions[role as keyof typeof roleDefinitions];
};
