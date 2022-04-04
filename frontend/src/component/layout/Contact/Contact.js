import React from "react";
import "./Contact.css";
import { Button } from "@material-ui/core";

const Contact = () => {
  return (
    <div className="contactContainer">
      <a
        className="mailBtn"
        href="mailto:surendragahlot57@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>Contact: surendragahlot57@gmail.com</Button>
      </a>
    </div>
  );
};

export default Contact;
