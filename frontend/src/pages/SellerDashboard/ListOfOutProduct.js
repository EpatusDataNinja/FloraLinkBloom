import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner, Container } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faShoppingBag, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import ReactPaginate from "react-paginate";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Title from "../../components_part/TitleCard";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(6); // Number of products per page
  const navigate = useNavigate();

  // Fetch out-of-stock products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/v1/product/outofstock?page=${currentPage + 1}&limit=${productsPerPage}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Accept": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Out of stock products response:", data);

        if (response.ok) {
          setProducts(data.data);
          setPageCount(Math.ceil(data.total / productsPerPage));
        } else {
          console.error("Error response:", data);
          toast.error(data.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, productsPerPage]);

  // Handle page change for pagination
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleEditProduct = async (product) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/one/${product.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json",
          },
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        const productData = data.data;
        navigate("/seller/add-product", {
          state: {
            editMode: true,
            productData: {
              ...productData,
              categoryID: productData.category.id,
            },
          },
        });
      } else {
        toast.error(data.message || "Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Error loading product details");
    }
  };

  return (
    <Container className="mt-5">

      <Title title={'Out of Stock Products'}/>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row>
            {products.length > 0 ? (
              products.map((product) => (
                <Col md={4} sm={6} key={product.id} className="mb-4">
                  <Card className="shadow-sm">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        <FontAwesomeIcon icon={faShoppingBag} /> {product.category.name}
                      </Card.Subtitle>
                      <Card.Text>{product.description}</Card.Text>
                      <Card.Text>
                        <strong>Price:</strong> ${product.price}
                      </Card.Text>
                      <Card.Text>
                        <strong>Status:</strong> <span className="text-danger">{product.status}</span>
                      </Card.Text>
                      <Button 
                        variant="primary" 
                        className="mb-2 w-100"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit Product
                      </Button>
                      <Button variant="outline-primary" disabled className="w-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Notify Me When Available
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-warning" />
                <p>No out-of-stock products available.</p>
              </div>
            )}
          </Row>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              containerClassName={"pagination"}
              activeClassName={"active"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
            />
          </div>
        </>
      )}

      <ToastContainer />
    </Container>
  );
};

export default ProductsPage;
