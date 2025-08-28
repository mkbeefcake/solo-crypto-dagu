import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
// import "./styles.css";

export default function WorkflowTab() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const CustomTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
      textTransform: "none"
    })
  );
  return (
    <div>
      <div className="top-container">
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="lab API tabs example"
              >
                <CustomTab label="Advertised ScheduleAdvertised Schedule" value="1" />
                <CustomTab label="Pending Assignments" value="2" />
                <CustomTab label="Assign Schedule3" value="3" />
                <CustomTab label="Assign Schedule4" value="4" />
                <CustomTab label="Assign Schedule5" value="5" />
                <CustomTab label="Assign Schedule6" value="6" />
                <CustomTab label="Assign Schedule7" value="7" />
                <CustomTab label="Pending Assignments8" value="8" />
                <CustomTab label="Assign Schedule9" value="9" />
                <CustomTab label="Pending Assignments10" value="10" />
                <CustomTab label="Assign Schedule11" value="11" />
              </TabList>
            </Box>
            <TabPanel value="1">Advertised Schedule</TabPanel>
            <TabPanel value="2">Pending Assignments</TabPanel>
            <TabPanel value="3">3</TabPanel>
            <TabPanel value="4">4</TabPanel>
            <TabPanel value="5">5</TabPanel>
            <TabPanel value="6">6</TabPanel>
            <TabPanel value="7">7</TabPanel>
            <TabPanel value="8">8</TabPanel>
            <TabPanel value="9">9</TabPanel>
            <TabPanel value="10">10</TabPanel>
            <TabPanel value="11">11</TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  );
}
