import { CButton, CFormLabel } from "@coreui/react";
import { useEffect, useState, useRef } from "react";
import Toast from "../../components/Toast";

import {
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CCard,
  CCardHeader,
  CCardBody,
  CFormCheck,
  CFormInput,
  CSpinner,
  CToaster,
} from "@coreui/react";
import tr7TradingBot from "../../Model/tr7-trading-bot";

const DEFAULT_SYMBOL = "BTCUSDT";

const RSIConfigure = () => {
  const [loading, $loading] = useState(true);
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  const [curSymbolRsi, $curSymbolRsi] = useState([]);
  const [symbolList, $symbolList] = useState([]);
  const [rsiConfig, $rsiConfig] = useState({});
  const [isCheckAll, $isCheckAll] = useState(false);
  const [timeframes, $timeframes] = useState([]);
  const [timeframesStatus, $timeframesStatus] = useState({});
  // set active param
  function processTimeFrame(timeframes, symbTimeframe) {
    const tfStatus = {};
    timeframes.forEach((timeframe) => {
      tfStatus[timeframe] = symbTimeframe.includes(timeframe);
    });
    $timeframesStatus(tfStatus);
    const values = Object.values(tfStatus);
    // console.log(values);

    if (values.every((status) => status === true)) {
      $isCheckAll(true);
    } else {
      $isCheckAll(false);
    }
  }
  useEffect(() => {
    if (Object.keys(rsiConfig).length > 0) {
      $curSymbolRsi(rsiConfig[curSymbol].rsi);
      processTimeFrame(timeframes, rsiConfig[curSymbol].timeframe);
    }
  }, [curSymbol]);
  // load current RSI configuration
  function fetchingRsiConfig(activeSymbol = DEFAULT_SYMBOL) {
    (async function fetchRSIConfigure() {
      return await tr7TradingBot.getRSIConfig();
    })().then((res) => {
      const respRsi = res.data;
      const defaultRsi = respRsi["DEFAULT"];
      delete respRsi["DEFAULT"];
      const sortSymbols = Object.keys(respRsi).sort();
      let actSymbol = activeSymbol;
      if (!sortSymbols.includes(actSymbol)) {
        actSymbol = sortSymbols[0];
      }
      // console.log(timeframeStatus);
      $timeframes(defaultRsi.timeframe);
      $rsiConfig(respRsi);
      $symbolList(sortSymbols);
      $curSymbol(actSymbol);
      $curSymbolRsi(respRsi[actSymbol].rsi);
      // $curSymbolTimeframe(respRsi[actSymbol].timeframe);
      processTimeFrame(defaultRsi.timeframe, respRsi[actSymbol].timeframe);
      $loading(false);
    });
  }
  useEffect(() => {
    fetchingRsiConfig();
  }, []);

  function symbolChangeHandler(e) {
    $curSymbol(e.target.value);
  }

  function rsiConfigSubmitHandler() {
    // console.log("timeframesStatus", timeframesStatus);
    const curTimeframe = Object.entries(timeframesStatus)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key);
    // console.log(curTimeframe);
    const rsiConfigSubmit = {};
    rsiConfigSubmit[curSymbol] = {
      symbol: curSymbol,
      rsi: curSymbolRsi,
      timeframe: curTimeframe,
    };
    // console.log("rsiConfigSubmit", rsiConfigSubmit);
    // submit to server
    (async function fetchRSIConfigure() {
      return await tr7TradingBot.setRSIConfig(rsiConfigSubmit);
    })().then((res) => {
      // console.log(res);
      addToast(Toast("RSI Config", res.message));
      // reload
      fetchingRsiConfig(curSymbol);
    });
  }
  function rsiLowerChangeHandler(e) {
    $curSymbolRsi([Number(e.target.value), curSymbolRsi[1]]);
  }
  function rsiUpperChangeHandler(e) {
    $curSymbolRsi([curSymbolRsi[0], Number(e.target.value)]);
  }
  function timeframeTickChangeHandler(event) {
    // if (event.target.checked) {
    //   console.log("✅ Checkbox is checked");
    // } else {
    //   console.log("⛔️ Checkbox is NOT checked");
    // }
    let newTfValue = { ...timeframesStatus };
    newTfValue[event.target.id] = !newTfValue[event.target.id];
    const values = Object.values(newTfValue);
    if (values.every((status) => status === true)) {
      $isCheckAll(true);
    } else {
      $isCheckAll(false);
    }
    $timeframesStatus((current) => {
      const newTf = { ...current };
      newTf[event.target.id] = !newTf[event.target.id];
      return newTf;
    });
  }
  function timeframeCheckAllHandler(event) {
    const blCheck = event.target.checked;
    // console.log("blCheck", blCheck);
    $isCheckAll(!isCheckAll);
    $timeframesStatus((current) => {
      const newTf = { ...current };
      Object.keys(newTf).forEach((key) => {
        newTf[key] = blCheck;
      });
      // console.log(newTf);
      return newTf;
    });
  }
  // console.log("timeframesStatus", timeframesStatus);

  if (loading) {
    return <CSpinner color="info" />;
  } else {
    return (
      <CCard className="mb-4">
        <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
        <CCardHeader>RSI Config</CCardHeader>
        <CCardBody>
          <CRow className="d-flex d-flex-row justify-content-begin align-items-center">
            <CCol xs={10} lg={3}>
              <CInputGroup className="mb-2">
                <CInputGroupText
                  component="label"
                  htmlFor="inputSymbol"
                  className=""
                >
                  Symbol
                </CInputGroupText>
                <CFormSelect
                  id="inputSymbol"
                  onChange={symbolChangeHandler}
                  value={curSymbol}
                  options={symbolList}
                />
              </CInputGroup>

              <CInputGroup className="mb-2">
                <CInputGroupText
                  component="label"
                  htmlFor="inputSymbol"
                  className=""
                >
                  RSI
                </CInputGroupText>
                <CFormInput
                  type="number"
                  min={0}
                  max={100}
                  placeholder="lower"
                  aria-label=""
                  value={curSymbolRsi[0] || ""}
                  id={"rsi-lower"}
                  onChange={rsiLowerChangeHandler}
                />
                <CFormInput
                  type="number"
                  min={0}
                  max={100}
                  placeholder="upper"
                  aria-label=""
                  value={curSymbolRsi[1] || ""}
                  id={"rsi-upper"}
                  onChange={rsiUpperChangeHandler}
                />
              </CInputGroup>
            </CCol>
            <CCol xs={10} lg={7}>
              <CCard className="mb-4">
                <CCardHeader className="d-flex d-flex-row justify-content-between">
                  Timeframe
                  <CFormCheck
                    className="mx-4"
                    inline
                    id={"inlinecheckboxAll"}
                    value={isCheckAll}
                    defaultChecked={isCheckAll}
                    label="All"
                    onChange={timeframeCheckAllHandler}
                  />
                </CCardHeader>
                <CCardBody className="d-flex d-flex-row justify-content-around">
                  {timeframes.map((timeframe, idx) => {
                    return (
                      <CFormCheck
                        inline
                        id={timeframe}
                        key={timeframe}
                        value={timeframesStatus[timeframe]}
                        defaultChecked={timeframesStatus[timeframe]}
                        label={timeframe}
                        onChange={timeframeTickChangeHandler}
                      />
                    );
                  })}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol
              xs={10}
              lg={1}
              className="d-flex d-flex-column justified-contend-around"
            >
              {/* <CButton
                onClick={rsiConfigSubmitHandler}
                color="warning"
                className="mx-2"
              >
                Reset
              </CButton> */}
              <CButton onClick={rsiConfigSubmitHandler}>Submit</CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    );
  }
};
const RSIState = ({ stateHandler }) => {
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const [running, $running] = useState();

  function fetchingState() {
    // load state from backend server
    (async function getState() {
      return await tr7TradingBot.rsiGetState();
    })().then((resp) => {
      // console.log(resp);
      const state = resp.data === "RSI_RUNNING" ? true : false;
      $running(state);
      stateHandler(state);
    });
  }
  useEffect(() => {
    fetchingState();
  });
  function startStopClickHandler() {
    const state = !running;
    (async function startRsiAnalysic() {
      return await tr7TradingBot.rsiAnalysicSubmit(state);
    })().then((res) => {
      // console.log(res);
      if (!res.success) {
        addToast(Toast("RSI State", res.message));
      }
      fetchingState();
    });
  }

  return (
    <CCard className="mb-4">
      <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
      <CCardHeader>RSI State</CCardHeader>
      <CCardBody>
        <CRow className="d-flex d-flex-row justify-content-begin">
          <CCol xs={5} lg={4}>
            <CFormLabel>
              RSI State: {running ? "running" : "stopped"}
            </CFormLabel>
          </CCol>
          <CCol xs={5} lg={4}>
            <CButton
              color={running ? "danger" : "warning"}
              size="lg"
              onClick={startStopClickHandler}
            >
              {running ? "Stop" : "Start"}
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

const RSISymbolView = () => {
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  const [symbolList, $symbolList] = useState([]);

  useEffect(() => {
    (async function fetchSymbolList() {
      return await tr7TradingBot.getSymbolList();
    })().then((res) => {
      const sortSymbols = res.symbols.sort();
      $symbolList(sortSymbols);
      if (sortSymbols.indexOf(DEFAULT_SYMBOL) === -1) {
        $curSymbol(sortSymbols[0]);
      }
    });
  }, []);

  function symbolChangeHandler(e) {
    $curSymbol(e.target.value);
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>RSI View</CCardHeader>
      <CCardBody>
        <CRow className="d-flex d-flex-row justify-content-begin">
          <CCol xs={10} lg={3}>
            <CInputGroup className="mb-2">
              <CInputGroupText
                component="label"
                htmlFor="inputSymbol"
                className=""
              >
                Symbol
              </CInputGroupText>
              <CFormSelect
                id="inputSymbol"
                onChange={symbolChangeHandler}
                value={curSymbol}
                options={symbolList}
              />
            </CInputGroup>
          </CCol>
          <CCol xs={10} lg={4}>
            <div>timeframe select</div>
          </CCol>
        </CRow>
        <CRow>RSI Chart here</CRow>
      </CCardBody>
    </CCard>
  );
};

const RSIAnalysic = () => {
  const [running, $running] = useState();
  function onStateChange(state) {
    $running(state);
  }
  return (
    <div className="">
      <RSIConfigure className="" />
      <RSIState stateHandler={onStateChange} />
      {running && <RSISymbolView />}
    </div>
  );
};

export default RSIAnalysic;
