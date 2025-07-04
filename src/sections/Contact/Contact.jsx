import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    setShowSuccess(true);
    setFormData({ name: "", email: "", comment: "" });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="contact-container">
      <div className="row">
        <div className="mt-4 col-xl-6 col-lg-6 col-md-6 text-center">
            <h1>Reach Out to Our Team</h1>
            <p>Contact THunder for any inquiries about our athlete supplements in the United Kingdom.</p>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6">
          <div className="contact-form-wrapper">
            <h2>Contact Us</h2>
            <p className="contact-subtitle">We'd love to hear from you!</p>

            {showSuccess && (
              <div className="success-message">
                Your notes have been successfully sent!
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  placeholder="Enter your message"
                  rows="5"
                />
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
