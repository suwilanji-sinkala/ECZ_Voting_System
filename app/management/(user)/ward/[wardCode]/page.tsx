"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/management/components/Navbar";

type WardDetails = {
  Ward_Code: string;
  Ward_Name: string;
  constituency?: {
    Constituency_Code: string;
    Constituency_Name: string;
    District_Code: string;
  };
  district?: {
    District_Code: string;
    District_Name: string;
  };
};

export default function WardDetailsPage() {
  const { wardCode } = useParams<{ wardCode: string }>();
  const router = useRouter();
  const [ward, setWard] = useState<WardDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardCode) return;

    const fetchWard = async () => {
      try {
        const res = await fetch(`/api/ward?Ward_Code=${wardCode}`);
        if (!res.ok) throw new Error("Failed to fetch ward details");
        const data = await res.json();
        setWard(data);
      } catch (error) {
        console.error("Error fetching ward:", error);
        setWard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWard();
  }, [wardCode]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">
        <div className="spinner-border me-2" role="status" />
        Loading ward details...
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="container text-center mt-5">
        <h3 className="text-danger mb-4">Ward not found</h3>
        <button className="btn btn-primary" onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return (
  <>
    <Navbar title="Ward Details" />
    <div className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-primary mb-4">Ward Details</h2>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Ward Code:</strong> {ward.Ward_Code}
            </li>
            <li className="list-group-item">
              <strong>Ward Name:</strong> {ward.Ward_Name}
            </li>
            {ward.constituency && (
              <li className="list-group-item">
                <strong>Constituency:</strong> {ward.constituency.Constituency_Name} (
                {ward.constituency.Constituency_Code})
              </li>
            )}
            {ward.district && (
              <li className="list-group-item">
                <strong>District:</strong> {ward.district.District_Name} (
                {ward.district.District_Code})
              </li>
            )}
          </ul>
          <div className="mt-4 text-end">
            <button className="btn btn-secondary" onClick={() => router.back()}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
