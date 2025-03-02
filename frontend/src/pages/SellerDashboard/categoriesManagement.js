import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Table, Input, Button, Pagination } from "antd";
import Title from "../../components_part/TitleCard";
const API_URL = `${process.env.REACT_APP_BASE_URL}/api/v1/categories`;
const TOKEN =  localStorage.getItem("token");

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
    <div className="p-6 max-w-4xl mx-auto">
            <Title title={'Product category/type management'}/>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{width:'50%'}}
        />
        <Button type="primary" style={{margin:'0.2cm'}} onClick={handleAddOrEdit}>
          {editId ? "Update" : "Add"} Category
        </Button>
      </div>
      <Input
        placeholder="Search categories..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{width:'50%'}}
      />
      <Table
        loading={loading}
        dataSource={paginatedCategories}
        rowKey="id"
        columns={[
          { title: "ID", dataIndex: "id", key: "id" },
          { title: "Name", dataIndex: "name", key: "name" },
          {
            title: "Actions",
            render: (_, record) => (
              <div className="flex gap-2">
                <Button onClick={() => { setName(record.name); setEditId(record.id); }}>Edit</Button>
                <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
        pagination={false}
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredCategories.length}
        onChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
};

export default Categories;
