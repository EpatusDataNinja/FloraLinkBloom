import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiEnvelope, BiPhone, BiMap } from 'react-icons/bi';
import { Modal, Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from './loading';

const LandingPage = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        gender: '',
    
    });
    const [loading, setLoading] = useState(true);

    const [formData1, setFormData1] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [formDataImage, setFormDataImage] = useState({
        image: null,
    });

    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const [selectedUser, setSelectedUser] = useState([]);
    const [ID, setID] = useState('');
    const [status, setStatus] = useState('');
    const [image, setImage] = useState('');

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);

    const handleTogglePasswordModal = () => {
        setShowPasswordModal(!showPasswordModal);
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
    };

    const handleToggleFileUploadModal = () => {
        setShowFileUploadModal(!showFileUploadModal);
    };

    const handleCloseFileUploadModal = () => {
        setShowFileUploadModal(false);
    };

    useEffect(() => {
        setLoading(true);
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                console.log('Parsed user data:', parsedUser);
                setStatus(parsedUser.status);
                setFormData({
                    firstname: parsedUser.firstname || '',
                    lastname: parsedUser.lastname || '',
                    email: parsedUser.email || '',
                    phone: parsedUser.phone || '',
                    gender: parsedUser.gender || '',
                    image: parsedUser.image || '',
                });
                setID(parsedUser.id);
                setSelectedUser(parsedUser);
                
                // Set the image URL
                if (parsedUser.image) {
                    console.log('Initial image URL:', parsedUser.image);
                    setImage(parsedUser.image);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        } else {
            console.error('User information not found in local storage');
        }
        setLoading(false);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleChange1 = (e) => {
        setFormData1({
            ...formData1,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleChangeProfile = (e) => {
        setFormDataImage({
            ...formDataImage,
            [e.target.name]: e.target.files[0],
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/update/${ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const res = await response.json();
                toast.success(res.message);
                const updatedUser = { ...selectedUser, ...formData };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                await new Promise((resolve) => setTimeout(resolve, 3000));
                window.location.reload();
            } else {
                const errorData = await response.json();
                setError(errorData.message);
                toast.error(errorData.message);
            }
        } catch (error) {
            console.error('Error updating user profile', error);
            setError('Failed to update user profile. Please try again later.');
        }
    };

    const handleSubmit1 = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/changePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData1,
                }),
            });

            if (response.ok) {
                const res = await response.json();
                toast.success(res.message);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                window.location.reload();
            } else {
                const errorData = await response.json();
                setError(errorData.message);
                toast.error(errorData.message);
            }
        } catch (error) {
            console.error('Error changing password', error);
            setError('Failed to change password. Please try again later.');
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        if (!ID) {
            console.error('No user ID found');
            toast.error('User ID not found. Please try logging in again.');
            return;
        }

        if (!formDataImage.image) {
            console.error('No image selected');
            toast.error('Please select an image to upload');
            return;
        }

        // Log file details
        console.log('Selected file:', {
            name: formDataImage.image.name,
            type: formDataImage.image.type,
            size: formDataImage.image.size
        });

        try {
            setLoading(true);
            const formDataUpload = new FormData();
            formDataUpload.append('image', formDataImage.image);

            console.log('Sending request to update user:', ID);
            console.log('FormData contents:', {
                hasImage: formDataUpload.has('image'),
                imageType: formDataImage.image.type
            });

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/update/${ID}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Remove Content-Type header to let browser set it with boundary
                },
                body: formDataUpload,
            });

            const responseData = await response.json();
            console.log('Server response:', responseData);

            if (response.ok) {
                toast.success(responseData.message);
                
                // Update local state and storage with new image
                const updatedUser = { ...selectedUser, image: responseData.user.image };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Set the image URL directly from the response
                if (responseData.user.image) {
                    console.log('New image URL:', responseData.user.image);
                    setImage(responseData.user.image);
                }
                
                // Reset form and close modal
                setFormDataImage({ image: null });
                setShowFileUploadModal(false);
            } else {
                setError(responseData.message);
                toast.error(responseData.message);
                console.error('Upload failed:', responseData);
            }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setError('Failed to update profile picture. Please try again later.');
            toast.error('Failed to update profile picture. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* {loading ? <LoadingSpinner /> : <> */}

            <section id="contact" className="contact" style={{ marginTop: '-2cm' }}>
                <div className="container-fluid" data-aos="fade-up">
                    <div className="row gx-lg-0 gy-4">
                        <div className="col-lg-4" style={{ fontFamily: 'cursive' }}>
                            <div className="info-container d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'white', fontFamily: 'arial' }}>
                                <div className="info-itemx d-flex">
                                    <div>
                                        {image ? (
                                            <img 
                                                src={image} 
                                                alt="Profile" 
                                                style={{ 
                                                    width: '150px', 
                                                    height: '150px', 
                                                    borderRadius: '50%', 
                                                    objectFit: 'cover',
                                                    marginBottom: '20px',
                                                    cursor: 'pointer'
                                                }} 
                                                onClick={handleToggleFileUploadModal}
                                            />
                                        ) : (
                                            <div 
                                                style={{ 
                                                    width: '150px', 
                                                    height: '150px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '20px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={handleToggleFileUploadModal}
                                            >
                                                <span style={{ fontSize: '48px' }}>👤</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p style={{ fontFamily: 'arial', color: 'green', marginTop: '-0.3cm', marginBottom: 'cm', marginRight: '0.2cm', textAlign: 'center', cursor: 'pointer' }} onClick={handleToggleFileUploadModal}>
                                    <FaInfoCircle style={{ color: 'green' }} /> Click to your profile pic to edit !
                                </p>

                                <div className="info-item " style={{ backgroundColor: 'whitesmoke', color: 'black' }}>
                                    <div>
                                        <h4 style={{ textAlign: 'center' }}>{formData.firstname} &nbsp;{formData.lastname}  </h4>

                                      
                                    </div>
                                </div>
                             

                                <div className="info-item d-flex" style={{ backgroundColor: 'whitesmoke', color: 'black' }}>
                                    <i className="bi bi-envelope flex-shrink-0" style={{ backgroundColor: 'white' }}><BiEnvelope className="flex-shrink-0 bi bi-envelope flex-shrink-0" style={{ color: 'black' }} /></i>
                                    <div>
                                        <h4>Email:</h4>
                                        <p>{formData.email}</p>
                                    </div>
                                </div>

                                <div className="info-item d-flex" style={{ backgroundColor: 'whitesmoke', color: 'black' }}>
                                    <i className="bi bi-envelope flex-shrink-0" style={{ backgroundColor: 'white' }}><BiPhone className="flex-shrink-0 bi bi-envelope flex-shrink-0" style={{ color: 'black' }} /></i>
                                    <div>
                                        <h4>Call:</h4>
                                        <p>{formData.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <form onSubmit={handleSubmit} className="myform">
                                <h3 style={{ marginBottom: '1cm' }} >CHANGE PROFILE</h3>
                                <div className="row" style={{ paddingTop: '0cm' }}>
                                    <div className="col-md-6 form-group">
                                        <span>First name</span>
                                        <input type="text" name="firstname" className="form-control" id="firstname" value={formData.firstname} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 form-group mt-3 mt-md-0">
                                        <span>Last Name</span>
                                        <input type="text" className="form-control" name="lastname" id="lastname" value={formData.lastname} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group mt-3">
                                    <span>Email</span>
                                    <input type="text" className="form-control" disabled name="email" id="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="form-group mt-3">
                                    <span>Phone</span>
                                    <input type="text" className="form-control" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="row" style={{ paddingTop: '0.3cm' }}>
                                    <div className="col-md-6 form-group">
                                        <span>Gender</span>
                                        <input type="text" name="gender" className="form-control" id="gender" value={formData.gender} onChange={handleChange} />
                                    </div>
                                  
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="form-control" style={{ border: '1px solid green', backgroundColor: 'lightblue', color: 'green',margonTop:'0cm',borderRadius:'0.1cm' }} disabled={loading}>
                                        {loading ? <LoadingSpinner /> : ' Edit profile'}
                                    </button>
                                </div>
                                <div className="row" style={{ backgroundColor: '' }}>
                                    <div className="col-xl-4 col-md-4" style={{ padding: '0.4cm' }}></div>
                                    <div className="col-xl-4 col-md-4" style={{ padding: '0.4cm' }}></div>
                                    <div className="col-xl-4 col-md-4" style={{}}>
                                        <div style={{ textAlign: 'right', marginTop: '-1cm' }}>
                                            <Button
                                                variant=""
                                                onClick={handleTogglePasswordModal}
                                                style={{
                                                    backgroundColor: 'whitesmoke',
                                                    borderRadius: '6px',
                                                    fontFamily: 'arial',
                                                    textDecoration: 'none',
                                                    padding: '0.2cm',
                                                    width: '5cm',
                                                    color: 'green',
                                                    height: 'auto',
                                                    fontSize: '15px',
                                                    border:'2px solid green'
                                                }}
                                            >
                                                CHANGE PASSWORD
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* </>} */}

            <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit1} className="myform">
                        <div className="row" style={{ paddingTop: '0cm' }}>
                            <div className="form-group mt-3">
                                <span>old password</span>
                                <input type="password" className="form-control" name="oldPassword" id="password" placeholder="*********" onChange={handleChange1} />
                            </div>
                            <div className="form-group mt-3">
                                <span>new password</span>
                                <input type="password" className="form-control" name="newPassword" id="password" placeholder="*********" onChange={handleChange1} />
                            </div>
                            <div className="form-group mt-3">
                                <span>confirm password</span>
                                <input type="password" className="form-control" name="confirmPassword" id="confirmPassword" placeholder="*********" onChange={handleChange1} />
                            </div>
                            <div className="text-center">
                                <button type="submit" className="form-control" disabled={loading}>
                                    {loading ? <LoadingSpinner /> : ' Edit '}
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>


            <Modal show={showFileUploadModal} onHide={handleCloseFileUploadModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile Picture</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmitProfile} className="myform">
                        <div className="row" style={{ paddingTop: '0cm' }}>
                            <div className="form-group mt-3">
                                <input type="file" className="form-control" name="image" id="image" onChange={handleChangeProfile} />
                            </div>
                            <div>
                                <p style={{ fontFamily: 'cursive', color: 'green', margin: '0.5cm 0', marginBottom: '-1cm', marginRight: '0.2cm', textAlign: 'center' }}>
                                    <FaInfoCircle style={{ color: 'green' }} /> Please upload passport image
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            </div>
                            <div className="text-center">
                                <button type="submit" className="form-control" disabled={loading}>
                                    {loading ? <LoadingSpinner /> : ' apload'}
                                </button>
                            </div>
                        </div>
                    </form>


                </Modal.Body>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default LandingPage;
