import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import IconButton from '@mui/material/IconButton';
import { styled } from "@mui/material/styles";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import WorkFlow from "./Workflow";
import AddIcon from "@mui/icons-material/Add";

export default function WorkflowTab() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddTab = () => {
    alert('AddTab is clicked');
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
            <Box className="flex flex-column" sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="lab API tabs example"
              >
                <CustomTab label="Workflow 1" value="1" />
                <CustomTab label="Workflow 2" value="2" />
                <CustomTab label="Workflow 3" value="3" />
                <CustomTab label="Workflow 4" value="4" />
              </TabList>
              <IconButton onClick={handleAddTab} size="small" color="success">
                <AddIcon />
              </IconButton>              
            </Box>
            <TabPanel value="1"><WorkFlow/></TabPanel>
            <TabPanel value="2"><WorkFlow/></TabPanel>
            <TabPanel value="3"><WorkFlow/></TabPanel>
            <TabPanel value="4"><WorkFlow/></TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  );
}
