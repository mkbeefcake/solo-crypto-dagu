// WorkflowContext.js
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import initWorkFlows from './test.json'

const WorkflowContext = createContext();

const PROMPT_TEMPLATE = `You are an expert React Flow designer. 
Given the following user request, generate or modify a detailed workflow in JSON format. 
The workflow should include steps, conditions, and actions to achieve the user's goal.

User Request: {user_request}
Workflow JSON:`;
      


export const WorkflowProvider = ({ children }) => {
  const [workflows, setWorkflows] = useState([]); // list of workflows
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  // Ask Claude AI to generate or modify a workflow
  const askToClaude = async (userMessage, workflow) => {
    try {
      const res = await axios.post("/api/workflow/claude", { 
        user_request: userMessage,
        current_json: workflow ? JSON.stringify(workflow) : ""
      }); 
      
      console.log(`askToCluade : ${JSON.stringify(res)}`)
      return res.data.updated_json;

    } catch (err) {
      console.error("askClaude failed:", err);
      return "";
    }
  };

  // Save workflow to backend
  const saveWorkflow = async (workflow) => {
    try {
      if (workflow.id) {
        await axios.put(`/api/workflows/${workflow.id}`, workflow);
      } else {
        const res = await axios.post("/api/workflows", workflow);
        setWorkflows((prev) => [...prev, res.data]); // backend returns id
        setActiveWorkflowId(res.data.id);
      }
    } catch (err) {
      console.error("saveWorkflow failed:", err);
    }
  };

  // Load workflow from backend
  const loadWorkflow = async (id) => {
    try {
      const res = await axios.get(`/api/workflows/${id}`);
      setWorkflows((prev) => {
        const exists = prev.find((w) => w.id === id);
        return exists
          ? prev.map((w) => (w.id === id ? res.data : w))
          : [...prev, res.data];
      });
      setActiveWorkflowId(id);
    } catch (err) {
      console.error("loadWorkFlow failed:", err);
    }
  };

    // delete workflow from backend
  const deleteWorkflow = async (id) => {
    try {
      const res = await axios.delete(`/api/workflows/${id}`);
      setWorkflows((prev) => {
        const exists = prev.find((w) => w.id === id);
        return exists
          ? prev.filter((w) => w.id !== id)
          : prev;
      });
      setActiveWorkflowId(workflows[0]?.id);
    } catch (err) {
      console.error("loadWorkFlow failed:", err);
    }
  };


  // Load All workflows from backend
  const loadAllWorkflows = async (id) => {
    try {
      debugger;
      const res = await axios.get(`/api/workflows`);
      setWorkflows(res.data);
      setActiveWorkflowId(res.data[0]?.id);
    } catch (err) {
      console.error("loadAllWorkFlows failed:", err);
      // setWorkflows(initWorkFlows)
      // setActiveWorkflowId(initWorkFlows[0]?.id);
    }
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        activeWorkflow,
        setActiveWorkflowId,
        saveWorkflow,
        loadWorkflow,
        deleteWorkflow,
        loadAllWorkflows,
        askToClaude
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(WorkflowContext);
