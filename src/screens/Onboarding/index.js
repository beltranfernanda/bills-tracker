import React, { useContext, useState, useCallback, useEffect } from "react";
import { GlobalContext, DispatchTypes } from "context";
import { NoHeaderLayout } from "layouts";
import { InputComponent, ButtonComponent, LoadingComponent } from "components";
import { useHistory } from "react-router-dom";
import { checkCredentials } from "services";
import * as S from "./styles";
import GoogleLogin from 'react-google-login';
import { sheetScope } from "config/sheet";
import { getUserSession } from "config/localStorage";
import { getAuthErrorMessage } from "config/errors";
import Utils from "lib/utils";
import { gapi } from 'gapi-script';
import { loadAuth2 } from 'gapi-script';

const Onboarding = () => {

  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

  const history = useHistory();

  const context = useContext(GlobalContext);
  const [, userDispatch] = context.globalUser;
  const [, modalDispatch] = context.globalModal;

  const userFromStorage = getUserSession();

  const [customLoading, setCustomLoading] = useState(false);

  const [values, setValues] = useState({
    name: userFromStorage?.name || "",
    spreadsheetId: userFromStorage?.spreadsheetId || "",
    access_token: userFromStorage?.access_token || "",
    expires_at: userFromStorage?.expires_at || "",
    refresh_token: userFromStorage?.refresh_token || "",
  });

  const alertModal = useCallback(
    (title, content) => {
      modalDispatch({
        type: DispatchTypes.Modal.MODAL_SHOW,
        title,
        content,
        actions: [
          {
            text: "Ok",
            action: () => {
              modalDispatch({ type: DispatchTypes.Modal.MODAL_HIDE });
            },
          },
        ],
      });
    },
    [modalDispatch]
  );

  const credentiaslCheck = useCallback(async (newValues) => {

    const { name, access_token, refresh_token, expires_at, spreadsheetId } = newValues;

    if (spreadsheetId) {
      const normalizedId = Utils.Common.getSpreadsheetId(spreadsheetId);


      userDispatch({ type: DispatchTypes.User.SET_USER_START });

      try {
        const valid = await checkCredentials({ access_token, expires_at, refresh_token, spreadsheetId: normalizedId });
        if (valid) {
          const newUserContext = {
            spreadsheetId: normalizedId,
            name: name,
            access_token,
            expires_at,
            refresh_token
          };

          userDispatch({
            type: DispatchTypes.User.SET_USER_SUCCESS,
            user: newUserContext,
          });
          history.push("/home");

        } else {
          alertModal(
            "Invalid credentials",
            "Please check your credentials and try again later."
          );
          userDispatch({ type: DispatchTypes.User.FINISH });
        }

      } catch (e) {
        alertModal(
          "Invalid credentials",
          "Please check your credentials and try again later."
        );
        userDispatch({ type: DispatchTypes.User.FINISH });
      }
    }


  }, [alertModal, history, userDispatch])


  const handleChange = (prop) => (name, value) => {
    setValues({ ...values, [prop]: value });
  };

  const responseGoogle = async (response) => {

    setCustomLoading(true);

    let auth2 = await loadAuth2(gapi, clientId, sheetScope);

    console.log("auth2",auth2);


    if (response.tokenObj) {
      const { access_token, expires_at, id_token } = response.tokenObj;
      const newCredentials = { ...values, access_token, expires_at, refresh_token: id_token };
      setValues(newCredentials);
      await credentiaslCheck(newCredentials);
      setCustomLoading(false);
    }

    if (response.code) {
      const { code } = response;
      const newCredentials = { ...values, refresh_token: code };
      setValues(newCredentials);
      await credentiaslCheck(newCredentials);
      setCustomLoading(false);
    }

    if (response.error) {
      setCustomLoading(false);
      const { error } = response;
      const errorMessage = getAuthErrorMessage(error);
      alertModal(
        "Error",
        errorMessage
      );
    }

  }

  const checkCredentialsOnLoad = useCallback(async (user) => {

    const { access_token, refresh_token, expires_at, spreadsheetId } = user;

    if (spreadsheetId) {
      const normalizedId = Utils.Common.getSpreadsheetId(spreadsheetId);

      try {
        const valid = await checkCredentials({ access_token, expires_at, refresh_token, spreadsheetId: normalizedId });
        if (valid) {
          history.push("/home");
        }

      } catch (e) {
      }

    }
  }, [history])

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: sheetScope
      });
    };
    gapi.load('client:auth2', initClient);
  });

  useEffect(() => {
    if (userFromStorage) {
      checkCredentialsOnLoad(userFromStorage)
    }
  }, [checkCredentialsOnLoad, userFromStorage])

  const buttonDisabled =
    values.name === "" ||
    values.spreadsheetId === "";

  return (
    <NoHeaderLayout>
      <S.Content>
        <div>
          <InputComponent
            name="name"
            title="Name"
            placeholder="Name"
            type="text"
            value={values.name || ""}
            onChange={handleChange("name")}
          />
          <InputComponent
            name="sId"
            title="Spreadsheet ID or URL"
            placeholder="Spreadheet ID or URL"
            type="bigtext"
            value={values.spreadsheetId || ""}
            onChange={handleChange("spreadsheetId")}
          />
          <GoogleLogin
            clientId={clientId}
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
            // uxMode="popup"
            // accessType="offline"
            scope={sheetScope}
            disabled={buttonDisabled}
            className="googleButton"
            isSignedIn={true}
          />
          <S.GoogleDisclaimer>
            Google will ask permissions to share your name, email address, languaje preference and profile picture with BillsTracker. We don’t save or track any information about you.
          </S.GoogleDisclaimer>
        </div>
        <div>
          <p className="text-center mb-0 mt-4">Need help?</p>
          <ButtonComponent text="Setup guide" type="text" />
        </div>
      </S.Content>
      {customLoading && <LoadingComponent />}
    </NoHeaderLayout>
  );

};

export default Onboarding;