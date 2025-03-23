import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
  } from 'react';
  
  /**
   * This interface defines the context value for controlling the editing mode
   * of the main menu buttons. The `editing` flag indicates if the main menu
   * is in an edit state (where buttons can be rearranged and display a jiggle effect)
   * and `setEditing` is the function to update that state.
   */
  interface MainMenuEditContextValue {
    editing: boolean;
    setEditing: Dispatch<SetStateAction<boolean>>;
  }
  
  // Create the context; initially it's undefined.
  const MainMenuEditContext = createContext<MainMenuEditContextValue | undefined>(undefined);
  
  /**
   * The MainMenuEditProvider wraps your components and provides the edit mode state.
   * This state determines if the main menu buttons are in edit mode.
   */
  export function MainMenuEditProvider({ children }: { children: ReactNode }) {
    const [editing, setEditing] = useState<boolean>(false);
  
    return (
      <MainMenuEditContext.Provider value={{ editing, setEditing }}>
        {children}
      </MainMenuEditContext.Provider>
    );
  }
  
  /**
   * A custom hook for accessing the main menu edit state.
   * This hook ensures that the consuming component is within a MainMenuEditProvider.
   */
  export function useMainMenuEdit() {
    const context = useContext(MainMenuEditContext);
    if (!context) {
      throw new Error('useMainMenuEdit must be used within a MainMenuEditProvider');
    }
    return context;
  }
  