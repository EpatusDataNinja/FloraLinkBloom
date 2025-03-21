import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Table, Input, Button, Pagination, Spin } from "antd";
import { Row, Col } from "react-bootstrap";
import Title from "../../components_part/TitleCard";
import { ToastContainer } from 'react-toastify';

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/v1/categories`;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 5;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Error fetching categories: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddOrEdit = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (editId) {
        const response = await axios.put(
          `${API_URL}/${editId}`,
          { name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data.success) {
          toast.success("Category updated successfully!");
          setName("");
          setEditId(null);
          await fetchCategories();
        }
      } else {
        const response = await axios.post(
          `${API_URL}/add`,
          { name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data.success) {
          toast.success("Category added successfully!");
          setName("");
          await fetchCategories();
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          "Failed to add/update category";
      toast.error(errorMessage);
      
      // Specific handling for duplicate category
      if (error.response?.data?.message?.includes("already exists")) {
        toast.warning("This category already exists!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted successfully");
      await fetchCategories(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting category");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="content-wrapper">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Title title="Product Categories" />
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <div className="content-card">
            <div className="actions-row">
              <div className="input-group">
                <Input
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="category-input"
                  onPressEnter={handleAddOrEdit}
                  disabled={submitting}
                />
                <Button 
                  type="primary" 
                  onClick={handleAddOrEdit}
                  loading={submitting}
                >
                  {editId ? "Update" : "Add"} Category
                </Button>
              </div>
              
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="table-container">
              <Spin spinning={loading}>
                <Table
                  dataSource={paginatedCategories}
                  rowKey="id"
                  columns={[
                    { title: "ID", dataIndex: "id", key: "id" },
                    { title: "Name", dataIndex: "name", key: "name" },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) => (
                        <div className="action-buttons">
                          <Button 
                            onClick={() => { 
                              setName(record.name); 
                              setEditId(record.id); 
                            }}
                            disabled={submitting}
                          >
                            Edit
                          </Button>
                          <Button 
                            danger 
                            onClick={() => handleDelete(record.id)}
                            disabled={submitting}
                          >
                            Delete
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </Spin>
            </div>

            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredCategories.length}
                onChange={setCurrentPage}
              />
            </div>
          </div>
        </Col>
      </Row>

      <style jsx="true">{`
        .content-wrapper {
          padding: 20px;
          background: #f8f9fa;
        }

        .content-card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .actions-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 2;
        }

        .category-input {
          flex: 1;
        }

        .search-input {
          flex: 1;
        }

        .table-container {
          margin-bottom: 2rem;
          width: 100%;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-wrapper {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 15px;
          }

          .content-card {
            padding: 1rem;
          }

          .actions-row {
            flex-direction: column;
            align-items: stretch;
          }

          .input-group {
            flex-direction: column;
            width: 100%;
          }

          .category-input,
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;
