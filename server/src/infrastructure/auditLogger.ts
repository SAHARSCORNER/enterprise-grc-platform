import { prisma } from './prisma';
import { broadcastEvent } from './socket';
import { SocketEvents, ModuleName, UserRole } from '@grc/shared';

export async function logAuditAction(params: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: ModuleName;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}) {
  try {
    const entry = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        module: params.module,
        entityId: params.entityId || null,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });

    broadcastEvent(SocketEvents.AUDIT_LOG_NEW, entry);
    return entry;
  } catch (err) {
    console.error('Audit Log recording failed:', err);
  }
}
