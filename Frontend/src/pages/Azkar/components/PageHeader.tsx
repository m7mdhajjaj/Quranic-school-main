import PageHeaderShared from "../../../components/shared/Layout/PageHeader";

const PageHeader = () => {
  return (
    <PageHeaderShared
      title="الأذكار"
      subtitle="اختر نوع الأذكار التي تريد قراءتها"
      icon={<span className="text-5xl">📿</span>}
      showDivider={true}
    />
  );
};

export default PageHeader;
