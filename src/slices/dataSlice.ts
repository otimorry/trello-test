import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

type CreateTaskAction = {
  columnId: number;
  description: string;
};

type MoveTaskAction = {
  prevColumnId: number;
  newColumnId: number;
  prevPositionId: number;
  newPositionId: number;
};

export interface Task {
  id: number;
  description: string;
}

interface DashboardColumn {
  id: number;
  displayName: string;
  tasks: Task[];
}

const data = [
  {
    columnName: "To Do",
    tasks: ["Gather stakeholder feedback"],
  },
  {
    columnName: "In Progress",
    tasks: ["Write requirements"],
  },
  {
    columnName: "QA",
    tasks: ["Resourcing", "Design prototype", "Write automation tests"],
  },
  {
    columnName: "Done",
    tasks: [],
  },
];

const initialState: DashboardColumn[] = data.map((entry, colIndex) => {
  const dashboardColumn: DashboardColumn = {
    id: colIndex,
    displayName: entry.columnName,
    tasks: entry.tasks.map((task, taskId) => {
      return { id: taskId, description: task };
    }),
  };
  return dashboardColumn;
});

const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    createTask: (state, action: PayloadAction<CreateTaskAction>) => {
      const column = state.find(
        (column) => column.id === action.payload.columnId
      );
      if (column) {
        column.tasks.push({
          id: -1,
          description: action.payload.description,
        });

        // update ids for each task
        column.tasks.forEach((task, index) => (task.id = index));
      }
    },
    moveTask: (state, action: PayloadAction<MoveTaskAction>) => {
      // moving within the same column
      if (action.payload.prevColumnId === action.payload.newColumnId) {
        const columnn = state.find(
          (column) => column.id === action.payload.prevColumnId
        );
        // handle only when another task is hovered, not empty space
        if (columnn && action.payload.newPositionId !== -1) {
          // re-order based on the drop location
          const fromId = action.payload.prevPositionId;
          const toId = action.payload.newPositionId;
          columnn.tasks.splice(toId, 0, columnn.tasks.splice(fromId, 1)[0]);
          // update indexes for each task
          columnn.tasks.forEach((task, index) => (task.id = index));
        }
      } else {
        // moving to a different column
        // need to delete the task from one column, add to another, then re-order
        const prevColumn = state.find(
          (column) => column.id === action.payload.prevColumnId
        );
        const newColumn = state.find(
          (column) => column.id === action.payload.newColumnId
        );

        if (prevColumn && newColumn) {
          const taskToMove = prevColumn.tasks.find(
            (task) => task.id === action.payload.prevPositionId
          );
          if (taskToMove) {
            // remove task from the initial column
            prevColumn.tasks.splice(action.payload.prevPositionId, 1);
            // add task to the new column
            newColumn.tasks.push(taskToMove);

            // dragging to a non empty space (over a task) in the column
            // if dragging to an empty space, will add the task to the end of the column
            if (action.payload.newPositionId !== -1) {
              // re-order based on the drop location
              const fromId = newColumn.tasks.length - 1;
              const toId = action.payload.newPositionId;
              newColumn.tasks.splice(
                toId,
                0,
                newColumn.tasks.splice(fromId, 1)[0]
              );
            }

            // update ids for each task
            prevColumn.tasks.forEach((task, index) => (task.id = index));
            newColumn.tasks.forEach((task, index) => (task.id = index));
          }
        }
      }
    },
  },
});

export const { createTask, moveTask } = dataSlice.actions;
export default dataSlice.reducer;
