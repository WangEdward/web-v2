import React, {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  Box,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Spinner,
  Center,
  VStack,
} from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router";

import { useTranslation } from "react-i18next";
import Header from "./header";
import Footer from "./footer";
import Nav from "./nav";
import Error from "./error";
import Markdown from "../preview/markdown";
import Overlay from "../../../components/overlay";
import IContextProvider, { IContext,File as File_ } from "../context";

const Files = lazy(() => import("./files"));
const File = lazy(() => import("./file"));

const KuttyHero = () => {
  // console.log("KuttyHero");
  const bgColor = useColorModeValue("white", "gray.700");
  const { isOpen, onClose, onOpen } = useDisclosure();
  const initialRef = React.useRef();
  const history = useHistory();
  const { t } = useTranslation();
  const {
    getSetting,
    setPassword,
    password,
    settingLoaded,
    refresh,
    type,
    msg,
    files,
  } = useContext(IContext);

  const readme = useMemo(() => {
    if (type === "file") {
      return undefined;
    }
    const file = files.find((file) => file.name.toLowerCase() === "readme.md");
    if (
      file === undefined &&
      location.pathname === "/" &&
      getSetting("home readme url")
    ) {
      const homeReadmeFile: File_ = {
        name: "README.md",
        size: 0,
        type: -1,
        driver: "local",
        updated_at: "",
        thumbnail: "",
        url: getSetting("home readme url"),
      };
      return homeReadmeFile;
    }
    return file;
  }, [files, type, settingLoaded]);

  useEffect(() => {
    if (type === "unauthorized") {
      onOpen();
    }
  }, [type]);

  if (!settingLoaded) {
    return (
      <Center w="full" h="100vh">
        <Spinner color={getSetting("icon color") || "teal.300"} size="xl" />
      </Center>
    );
  }
  return (
    <Center className="index-box" w="full">
      <Overlay list />
      <VStack className="root-box" w={{ base: "95%", lg: "980px" }}>
        <Header />
        <Nav />
        <Box
          className="main-box"
          rounded="xl"
          shadow="lg"
          bgColor={bgColor}
          w="full"
        >
          {type === "loading" ? (
            <Center w="full" py="4">
              <Spinner
                color={getSetting("icon color") || "teal.300"}
                size="xl"
              />
            </Center>
          ) : (
            <Box className="content-box" w="full" p="2">
              <Suspense
                fallback={
                  <Center h="full">
                    <Spinner
                      color={getSetting("icon color") || "teal.300"}
                      size="xl"
                    />
                  </Center>
                }
              >
                {type === "folder" ? (
                  <Files />
                ) : type === "file" ? (
                  <File />
                ) : (
                  <Error msg={msg} />
                )}
              </Suspense>
            </Box>
          )}
        </Box>
        {type !== "loading" && readme && (
          <Box
            className="readme-box"
            rounded="xl"
            shadow="lg"
            bgColor={bgColor}
            w="full"
            p="4"
          >
            <Markdown file={readme} readme />
          </Box>
        )}
        <Footer />
      </VStack>
      <Modal
        initialFocusRef={initialRef as any}
        isOpen={isOpen}
        onClose={() => {
          // history.goBack();
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("input password")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              type="password"
              ref={initialRef as any}
              value={password}
              onChange={(e) => {
                setPassword!(e.target.value);
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  localStorage.setItem("password", password);
                  refresh();
                  onClose();
                }
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => {
                localStorage.setItem("password", password);
                refresh();
                onClose();
              }}
              mr={3}
            >
              {t("ok")}
            </Button>
            <Button
              colorScheme="gray"
              onClick={() => {
                history.goBack();
                onClose();
              }}
            >
              {t("cancle")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

const Layout = () => {
  return (
    <IContextProvider>
      <KuttyHero />
    </IContextProvider>
  );
};
export default Layout;
