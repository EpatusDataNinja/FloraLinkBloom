import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Offcanvas, Button, Nav } from 'react-bootstrap';
import '../../css/main2.css';
import Profile from "../../components_part/profile";
import Menu from "../../components_part/DashboardSidebar";
import Header from "../../components_part/header";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          toast.error('Please login to continue');
          return;
        }

        const user = JSON.parse(storedUser);
        setUserData(user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error loading user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedData) => {
    try {
      // Merge the updated data with existing user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const newUserData = {
        ...currentUser,
        ...updatedData,
        // Preserve any additional fields that might be in the current user data
        id: currentUser.id,
        status: currentUser.status,
        role: currentUser.role,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      // Update component state
      setUserData(newUserData);
      
      // Show success message
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='mybody'>
      <Header setShow={setShow} />
      <div className="dashboard" style={{backgroundColor:'whitesmoke'}}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2 d-none d-md-block">
              <Menu show={show} setShow={setShow} />
            </div>
            <main className="col-md-10 ms-sm-auto col-lg-10 px-md-4 allcontent">
              <div className="row">
                <div className="col-12 d-md-none">
                  <Button variant="" onClick={() => setShow(!show)}>
                    ☰
                  </Button>
                </div>
                <div style={{marginTop:'2cm'}}> 
                  {userData && (
                    <Profile 
                      initialData={userData}
                      onProfileUpdate={handleProfileUpdate}
                      show={showProfileModal}
                      onHide={() => setShowProfileModal(false)}
                    />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;