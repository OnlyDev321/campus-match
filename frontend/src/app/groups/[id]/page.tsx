import GroupDetail from "@/components/group/GroupDetail";
import MemberList from "@/components/group/MemberList";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const GroupDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Group detail #{id}</h1>

        <p className="text-sm text-gray-500">Route dynamic: /groups/{id}</p>
      </div>

      <div className="space-y-4">
        <GroupDetail />
        <MemberList />
      </div>
    </div>
  );
};

export default GroupDetailPage;
