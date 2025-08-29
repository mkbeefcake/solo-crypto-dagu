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
import { useWorkflow } from "./WorkFlowContext";

export default function WorkflowTab( { }) {

  const [value, setValue] = React.useState();
  const { workflows } = useWorkflow()

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

  React.useEffect(() => {
    setValue(workflows.length > 0 ? workflows[0].name : "")
  }, [])

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
                value={"workflow1"}
              >
                {
                  workflows.map((workflow, index) => (
                    <CustomTab 
                      key={`tab-${workflow.id}`} 
                      label={workflow.name} 
                      value={workflow.name} />
                  ))
                }
              </TabList>
              <IconButton onClick={handleAddTab} size="small" color="success">
                <AddIcon />
              </IconButton>              
            </Box>
            {
              workflows.map((workflow, index) => (
                <TabPanel key={`tabpanel-${workflow.id}`} value={workflow.name}>
                  <WorkFlow workflow={workflow.flow}/>
                </TabPanel>
              ))
            }
          </TabContext>
        </Box>
      </div>
    </div>
  );
}
