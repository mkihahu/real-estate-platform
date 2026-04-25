import React from "react";
import { myPropertiesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineLibrary,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";
import { useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useEffect } from "react";
import PropertyCard from "../../components/common/PropertyCard";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/property/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const props = Array.isArray(res.data)
          ? res.data
          : res.data.properties || [];
        setProperties(props);
        setLoading(false);
      } catch (err) {
        setError("Failed to load your properties:", err);
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [token]);

  // Delete a property
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this listing? This action is permanent.",
      )
    )
      return;

    try {
      await axios.delete(`${API_URL}/api/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property.", err);
    }
  };

  // Update status
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/property/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProperties(
        properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
      );
    } catch (err) {
      alert("Failed to update status:", err);
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  const getAvailableStatus = () => {
    return "sale";
  };

  return (
    <div className={s.fadeIn}>
      <div className={s.fadeIn}>
        <div className={s.header}>
          <div>
            <h1 className={s.heading}>My Listings</h1>
            <p className={s.subheading}>
              Manage your listed properties and their status.
            </p>
          </div>

          <Link to="/add-property" className={s.addButton}>
            <HiPlus size={20} /> Add New Listing
          </Link>
        </div>

        <div className={s.content}>
          {!Array.isArray(properties) || properties.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiOutlineLibrary size={40} color="#94a3b8" />
              </div>
              <h2 className={s.emptyTitle}>No Properties Found</h2>
              <p className={s.emptyText}>
                Start your Real Estate journey by adding your first listing.
              </p>
              <Link to="/add-property" className={s.emptyButton}>
                Add your first listing
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  key={p._id}
                  property={p}
                  renderActions={() => (
                    <>
                      <div className={s.actionContainer}>
                        <div className={s.selectWrapper}>
                          <select
                            value={p.status === "sale" ? "available" : p.status}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "available") {
                                updateStatus(p._id, getAvailableStatus(p));
                              } else {
                                updateStatus(p._id, val);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`${s.select} ${
                              p.status === "sold"
                                ? s.selectSold
                                : s.selectAvailable
                            }`}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </select>
                          <div className={s.selectIcon}>
                            <HiOutlineCheckCircle size={14} />
                          </div>
                        </div>

                        <Link
                          to={`/edit-property/${p._id}`}
                          className={s.editButton}
                        >
                          <HiOutlinePencilAlt size={14} /> Edit
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p._id);
                          }}
                          className={s.deleteButton}
                        >
                          <HiOutlineTrash size={14} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
