import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Table, Input, Button, Pagination } from "antd";
import { Row, Col } from "react-bootstrap";
import Title from "../../components_part/TitleCard";

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/v1/categories`;
const TOKEN = localStorage.getItem("token");

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
    setLoading(false);
  };

  const handleAddOrEdit = async () => {
    if (!name) return toast.error("Category name is required");
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, { name }, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        toast.success("Category updated successfully");
      } else {
        await axios.post(`${API_URL}/add`, { name }, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        toast.success("Category added successfully");
      }
      setName("");
      setEditId(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to add/update category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Error deleting category");
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
                />
                <Button type="primary" onClick={handleAddOrEdit}>
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
              <Table
                loading={loading}
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
                        <Button onClick={() => { setName(record.name); setEditId(record.id); }}>
                          Edit
                        </Button>
                        <Button danger onClick={() => handleDelete(record.id)}>
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                pagination={false}
              />
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
