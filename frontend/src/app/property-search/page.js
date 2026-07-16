import MainLayout from "@/components/layout/MainLayout";
import SearchBar from "@/components/property/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import OwnershipCard from "@/components/property/OwnershipCard";
import TaxHistoryTable from "@/components/property/TaxHistoryTable";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import TransactionHistoryTable from "@/components/property/TransactionHistoryTable";
import ActionButtons from "@/components/property/ActionButtons";

export default function PropertySearchPage() {
  return (
    <MainLayout>
      <SearchBar />
      <PropertyCard />
      <div className="mt-8 grid grid-cols-12 gap-6">

  <div className="col-span-4">
    <OwnershipCard />
  </div>

  <div className="col-span-8">
    <TaxHistoryTable />
  </div>

</div>
<div className="mt-8 grid grid-cols-12 gap-6">

  <div className="col-span-4">
    <BuildingInformationCard />
  </div>

  <div className="col-span-8">
    <TransactionHistoryTable />
  </div>

</div>

<ActionButtons />
    </MainLayout>
  );
}