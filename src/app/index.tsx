import React, { useState, useRef } from "react";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { createTask, moveTask, Task } from "../slices/dataSlice";

import "./App.css";

interface NewTaskProps {
  placeholder: string;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  handleCreateTask: () => void;
  handleCloseTask: () => void;
}

function NewTaskCard(props: NewTaskProps) {
  const [text, setText] = useState<string>("");
  const [valid, setValid] = useState<boolean>(true);
  return (
    <>
      <div
        style={{
          height: 75,
          margin: 8,
          padding: 8,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      >
        <textarea
          placeholder={props.placeholder}
          style={{ width: "100%", height: "100%" }}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onBlur={(e) => props.setTaskDescription(text)}
        />
      </div>

      {!valid ? (
        <div style={{ margin: 4, color: "red" }}>Text cannot be empty!</div>
      ) : (
        <></>
      )}

      <div style={{ display: "flex", flexDirection: "row", marginLeft: 8 }}>
        <button
          style={{
            backgroundColor: "#31ab31",
            border: "none",
            color: "white",
            borderRadius: 2,
            width: 100,
            height: 35,
          }}
          onClick={(e) => {
            if (text) {
              props.handleCreateTask();
            } else {
              setValid(false);
            }
          }}
        >
          Add Card
        </button>
        <button
          style={{
            backgroundColor: "transparent",
            border: "none",
            borderRadius: 2,
            width: 50,
            height: 35,
          }}
          onClick={(e) => props.handleCloseTask()}
        >
          X
        </button>
      </div>
    </>
  );
}

interface TaskCardProps {
  columnId: number;
  cardId: number;
  description: string;
  handleDragStart: (e: any, columnId: number, taskId: number) => void;
  handleDragEnter: (e: any, columnId: number, taskId: number) => void;
}

function TaskCard(props: TaskCardProps) {
  return (
    <div
      style={{
        margin: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "white",
        textAlign: "left",
      }}
      draggable={true}
      onDragStart={(e) =>
        props.handleDragStart(e, props.columnId, props.cardId)
      }
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.stopPropagation();
        props.handleDragEnter(e, props.columnId, props.cardId);
      }}
    >
      {props.description}
    </div>
  );
}

function Dashboard() {
  const dashboardData = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();

  const startDragColId = useRef<number | null>(null);
  const startDragTaskId = useRef<number | null>(null);
  const dragOverColId = useRef<number | null>(null);
  const dragOverTaskId = useRef<number | null>(null);

  const handleTaskDragStart = (e: any, columnId: number, taskId: number) => {
    startDragColId.current = columnId;
    startDragTaskId.current = taskId;
  };

  const handleTaskDragEnter = (e: any, columnId: number, taskId: number) => {
    dragOverColId.current = columnId;
    dragOverTaskId.current = taskId;

    dispatch(
      moveTask({
        prevColumnId: startDragColId.current ?? -1,
        newColumnId: dragOverColId.current ?? -1,
        prevPositionId: startDragTaskId.current ?? -1,
        newPositionId: dragOverTaskId.current ?? -1,
      })
    );

    startDragTaskId.current = dragOverTaskId.current;
    startDragColId.current = dragOverColId.current;
    dragOverTaskId.current = null;
    dragOverColId.current = null;
  };

  const handleColumnDragEnter = (
    e: any,
    columnId: number,
    taskId: number,
    newPos: number
  ) => {
    dragOverColId.current = columnId;
    dragOverTaskId.current = taskId;

    if (startDragColId.current !== dragOverColId.current) {
      dispatch(
        moveTask({
          prevColumnId: startDragColId.current ?? -1,
          newColumnId: dragOverColId.current ?? -1,
          prevPositionId: startDragTaskId.current ?? -1,
          newPositionId: dragOverTaskId.current ?? -1,
        })
      );
      startDragTaskId.current = newPos;
      startDragColId.current = dragOverColId.current;
      dragOverTaskId.current = null;
      dragOverColId.current = null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "inherit",
      }}
    >
      {dashboardData.map((column) => {
        return (
          <DashboardColumn
            key={column.id}
            columnId={column.id}
            displayName={column.displayName}
            tasks={column.tasks}
            handleTaskDragStart={handleTaskDragStart}
            handleTaskDragEnter={handleTaskDragEnter}
            handleColumnDragEnter={handleColumnDragEnter}
          />
        );
      })}
    </div>
  );
}

interface DashboardColumnProps {
  displayName: string;
  tasks: Task[];
  columnId: number;
  handleTaskDragStart: (e: any, columnId: number, taskId: number) => void;
  handleTaskDragEnter: (e: any, columnId: number, taskId: number) => void;
  handleColumnDragEnter: (
    e: any,
    columnId: number,
    taskId: number,
    newPos: number
  ) => void;
}

function DashboardColumn(props: DashboardColumnProps) {
  const dispatch = useDispatch();
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [isCreatingNewTask, setIsCreatingNewTask] = useState<boolean>(false);

  const handleCreateTask = () => {
    dispatch(
      createTask({
        columnId: props.columnId,
        description: newTaskDescription,
      })
    );
    setNewTaskDescription("");
    setIsCreatingNewTask(false);
  };
  const handleCloseTask = () => {
    setNewTaskDescription("");
    setIsCreatingNewTask(false);
  };

  return (
    <div
      style={{
        display: "flex",
        minWidth: 300,
        width: 300,
        height: "inherit",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          borderRadius: 4,
          flexDirection: "column",
          backgroundColor: "whitesmoke",
          margin: 16,
        }}
      >
        <div>{props.displayName}</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
          onDragEnter={(e) =>
            props.handleColumnDragEnter(
              e,
              props.columnId,
              -1,
              props.tasks.length
            )
          }
        >
          {props.tasks.map((task) => {
            return (
              <TaskCard
                key={task.id}
                cardId={task.id}
                description={task.description}
                columnId={props.columnId}
                handleDragStart={props.handleTaskDragStart}
                handleDragEnter={props.handleTaskDragEnter}
              />
            );
          })}
          {isCreatingNewTask ? (
            <NewTaskCard
              placeholder="Enter a title for this card..."
              setTaskDescription={setNewTaskDescription}
              handleCreateTask={handleCreateTask}
              handleCloseTask={handleCloseTask}
            />
          ) : (
            <></>
          )}
        </div>
        <button
          style={{ border: "none", height: 35 }}
          onClick={() => setIsCreatingNewTask(true)}
        >
          + Add Another Card
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <div className="App">
        <Dashboard />
      </div>
    </>
  );
}

export default App;
