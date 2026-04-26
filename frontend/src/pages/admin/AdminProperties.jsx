import React from "react";
import { adminPropertiesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../hooks/useAuth";
import PropertyCard from "../../components/common/PropertyCard";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlineExternalLink, HiOutlineTrash } from "react-icons/hi";
import axios from "axios";
import API_URL from "../../config";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const props = Array.isArray(res.data)
          ? res.data
          : res.data.properties || [];
        setProperties(props);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load properties:", err);
        setLoading(false);
      }
    };
    fetchProperties();
  }, [token]);

  // Delete a property
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This action is permanent.",
      )
    )
      return;

    try {
      await axios.delete(`${API_URL}/api/admin/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property.", err);
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <>
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Property Moderation</h1>
        <p className={s.pageSubtitle}>
          Review and manage all listings accross the platform.
        </p>
      </div>
      <div className={s.headerContainer}>
        {" "}
        {properties.length === 0 ? (
          <div className={s.emptyStateCard}>
            No properties pending moderation.
          </div>
        ) : (
          <div className={s.propertiesGrid}>
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                renderActions={() => (
                  <div className={s.actionWrapper}>
                    <div className={s.sellerInfo}>
                      <div className={s.sellerName}>
                        Seller: {p.seller?.name || "Unknown"}
                      </div>
                      <div className={s.sellerEmail}>{p.seller?.email}</div>
                    </div>

                    <div className={s.buttonGroup}>
                      <Link to={`/property/${p._id}`} className={s.viewLink}>
                        <HiOutlineExternalLink size={16} />
                      </Link>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className={s.deleteButton}
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProperties;
