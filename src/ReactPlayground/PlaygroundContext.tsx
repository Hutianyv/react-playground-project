import { languages } from "monaco-editor";
import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { fileName2Language } from "./utils";
import { initFiles } from "./files";
import { compress, uncompress } from "./utils";
export interface File {
  name: string;
  value: string;
  language: string;
}
export interface Files {
  [key: string]: File;
}
export interface PlaygroundContext {
  files: Files;
  selectedFileName: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setSelectedFileName: (fileName: string) => void;
  setFiles: (files: Files) => void;
  addFile: (fileName: string) => void;
  removeFile: (fileName: string) => void;
  updateFileName: (oleFileName: string, newFileName: string) => void;
}

type Theme = 'light' | 'dark'

export const PlaygroundContext = createContext<PlaygroundContext>({
  selectedFileName: "App.tsx",
} as PlaygroundContext);

const getFilesFromUrl = () => {
  let files: Files | undefined
  try {
      const hash = uncompress(window.location.hash.slice(1))
      files = JSON.parse(hash)
  } catch (error) {
    console.error(error)
  }
  return files
}



export const PlaygroundProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [files, setFiles] = useState<Files>( getFilesFromUrl() || initFiles);
  const [selectedFileName, setSelectedFileName] = useState<string>("App.tsx");
  const [theme, setTheme] = useState<Theme>('light');

  const addFile = (name: string) => {
    files[name] = {
      name,
      language: fileName2Language(name),
      value: "",
    };
    setFiles({ ...files });
  };

  const removeFile = (name: string) => {
    delete files[name];
    setFiles({ ...files });
  };

  const updateFileName = (oldFileName: string, newFileName: string) => {
    if (
      !files[oldFileName] ||
      newFileName === undefined ||
      newFileName === "null"
    )
      return;
    const { [oldFileName]: value, ...rest } = files;
    const newFile = {
      [newFileName]: {
        ...value,
        language: fileName2Language(newFileName),
        name: newFileName,
      },
    };
    setFiles({ ...rest, ...newFile });
  };

 useEffect(() => {
    const hash = JSON.stringify(files);
    window.location.hash = compress(hash);
  }, [files])

  return (
    <PlaygroundContext.Provider
      value={{
        theme,
        setTheme,
        files,
        selectedFileName,
        setSelectedFileName,
        setFiles,
        addFile,
        removeFile,
        updateFileName,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};
