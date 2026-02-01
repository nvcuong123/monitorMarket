/**
 * 1. Fetch list of api keys
 * 2. Submit password, along with the selected api key to server for verify and get JWT
 * 3. Save JWT as cookie for further process
 * 4. Hanldle Error in case verfying failed
 */
import { useState, useRef } from "react";
import { useAuth } from "../Provider/Auth";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "../components/Toast";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CToaster,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilLockUnlocked, cilUser } from "@coreui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser } from "@fortawesome/free-solid-svg-icons";

const PasswordIcon = (props) => {
  if (props.showPassword) return <FontAwesomeIcon icon={faEyeSlash} />;
  return <FontAwesomeIcon icon={faEye} />;
};
const FaIconUser = () => <FontAwesomeIcon icon={faUser} />;

const Login = () => {
  const [showPassword, $showPassword] = useState(false);
  const { onLogin } = useAuth();
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  // const [username, $username] = useState("");
  // const [inputPassword, $inputPassword] = useState("");

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   onLogin(username, inputPassword);
  // };

  // function handleInputUserName(e) {
  //   $username(e.target.value);
  // }
  // function handleInputPassword(e) {
  //   $inputPassword(e.target.value);
  // }
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <Formik
                    initialValues={{ username: "", password: "" }}
                    onSubmit={async (values, { setSubmitting }) => {
                      const error = await onLogin(
                        values.username,
                        values.password
                      );
                      console.log(error);
                      addToast(Toast("Login Failed!", error.message));
                    }}
                    validationSchema={Yup.object().shape({
                      username: Yup.string().required("Required"),
                      password: Yup.string().required("Required"),
                    })}
                  >
                    {(props) => {
                      const {
                        values,
                        touched,
                        errors,
                        handleChange,
                        handleSubmit,
                        handleBlur,
                      } = props;

                      return (
                        <CForm onSubmit={handleSubmit}>
                          <h1>Login</h1>
                          <p className="text-medium-emphasis">
                            Please input username & password
                          </p>
                          <CInputGroup className="mb-3">
                            <CInputGroupText>
                              <FaIconUser />
                            </CInputGroupText>
                            <CFormInput
                              id="username"
                              placeholder="Username"
                              autoComplete="username"
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            {errors.username && touched.username && (
                              <div className="text-danger mx-2">
                                {errors.username}
                              </div>
                            )}
                          </CInputGroup>
                          <CInputGroup className="mb-4">
                            <CInputGroupText
                              onClick={() => $showPassword(!showPassword)}
                            >
                              <PasswordIcon showPassword={showPassword} />
                            </CInputGroupText>
                            <CFormInput
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              autoComplete="current-password"
                              onChange={handleChange}
                            />
                            {errors.password && touched.password && (
                              <div className="text-danger mx-2">
                                {errors.password}
                              </div>
                            )}
                          </CInputGroup>

                          <CRow>
                            <CCol xs={6}>
                              <CButton
                                color="primary"
                                className="px-4"
                                type="submit"
                              >
                                Login
                              </CButton>
                            </CCol>
                          </CRow>
                        </CForm>
                      );
                    }}
                  </Formik>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
        {/* <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">
                      Please input username & password
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="username"
                        autoComplete="username"
                        onChange={handleInputUserName}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={handleInputPassword}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          // onClick={handleSubmit}
                          type="submit"
                        >
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow> */}
      </CContainer>
    </div>
  );
};

export default Login;
