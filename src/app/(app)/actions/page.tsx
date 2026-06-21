import { getUserActionsAction } from '@/features/actions/api/actionActions';
import { ActionList } from '@/features/actions/components/ActionList';

export const metadata = { title: 'Actions' };

export default async function ActionsPage() {
  const userActions = await getUserActionsAction();

  return <ActionList userActions={userActions} />;
}
