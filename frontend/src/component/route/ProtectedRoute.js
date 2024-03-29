import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ Component, ...rest }) => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);

  return (
    <Fragment>
      {loading === false && !isAuthenticated ? (
        <Navigate to="/login" />
      ) : (
        <Outlet />
      )}
    </Fragment>
  );
};

export default ProtectedRoute;
