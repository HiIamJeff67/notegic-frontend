import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { mutationFnCreateMyAPIKey } from "@shared/api/invokers/apiKey.invoker";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@shared/api/invokers/auth.invoker";
import {
  mutationFnCreateBlockPack,
  mutationFnUpdateMyBlockPackById,
} from "@shared/api/invokers/blockPack.invoker";
import { mutationFnSubmitFeedbackReport } from "@shared/api/invokers/feedback.invoker";
import {
  mutationFnCreateMyMaterial,
  mutationFnUpdateMyMaterialById,
} from "@shared/api/invokers/material.invoker";
import {
  mutationFnCreateRootShelf,
  mutationFnUpdateMyRootShelfById,
  mutationFnUpsertRootShelfPermission,
} from "@shared/api/invokers/rootShelf.invoker";
import {
  mutationFnCreateRoutineByStationId,
  mutationFnUpdateMyRoutineById,
} from "@shared/api/invokers/routine.invoker";
import {
  mutationFnCreateRoutineTaskByRoutineId,
  mutationFnUpdateMyRoutineTaskById,
} from "@shared/api/invokers/routineTask.invoker";
import { mutationFnUpdateRoutineTaskGraphByRoutineId } from "@shared/api/invokers/routineTaskDependency.invoker";
import {
  mutationFnCreateStation,
  mutationFnUpdateMyStationById,
} from "@shared/api/invokers/station.invoker";
import {
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnUpdateMySubShelfById,
} from "@shared/api/invokers/subShelf.invoker";
import { mutationFnUpdateMe } from "@shared/api/invokers/user.invoker";
import { mutationFnUpdateMyAccount } from "@shared/api/invokers/userAccount.invoker";
import { mutationFnUpdateMyInfo } from "@shared/api/invokers/userInfo.invoker";
import { createQueryClient } from "@shared/api/queryClient";
import { resources, supportedLanguages } from "@shared/i18n";
import { tError } from "@shared/i18n/error";
import { createInstance } from "i18next";
import * as apiKeyAPI from "@/api/functions/apiKey.serverFn";
import { CreateMyAPIKey } from "@/api/functions/apiKey.serverFn";
import * as authAPI from "@/api/functions/auth.serverFn";
import {
  DeleteMe,
  ForgetPassword,
  ResetEmail,
  ResetMe,
  SendAuthCode,
  ValidateEmail,
} from "@/api/functions/auth.serverFn";
import * as blockPackAPI from "@/api/functions/blockPack.serverFn";
import {
  CreateBlockPack,
  UpdateMyBlockPackById,
} from "@/api/functions/blockPack.serverFn";
import * as feedbackAPI from "@/api/functions/feedback.serverFn";
import { SubmitFeedbackReport } from "@/api/functions/feedback.serverFn";
import * as materialAPI from "@/api/functions/material.serverFn";
import {
  CreateMyMaterial,
  UpdateMyMaterialById,
} from "@/api/functions/material.serverFn";
import * as rootShelfAPI from "@/api/functions/rootShelf.serverFn";
import {
  CreateRootShelf,
  UpdateMyRootShelfById,
  UpsertRootShelfPermission,
} from "@/api/functions/rootShelf.serverFn";
import * as routineAPI from "@/api/functions/routine.serverFn";
import {
  CreateRoutineByStationId,
  UpdateMyRoutineById,
} from "@/api/functions/routine.serverFn";
import * as routineTaskAPI from "@/api/functions/routineTask.serverFn";
import {
  CreateRoutineTaskByRoutineId,
  UpdateMyRoutineTaskById,
} from "@/api/functions/routineTask.serverFn";
import * as routineTaskDependencyAPI from "@/api/functions/routineTaskDependency.serverFn";
import { UpdateRoutineTaskGraphByRoutineId } from "@/api/functions/routineTaskDependency.serverFn";
import * as stationAPI from "@/api/functions/station.serverFn";
import {
  CreateStation,
  UpdateMyStationById,
} from "@/api/functions/station.serverFn";
import * as subShelfAPI from "@/api/functions/subShelf.serverFn";
import {
  CreateSubShelfByRootShelfId,
  UpdateMySubShelfById,
} from "@/api/functions/subShelf.serverFn";
import * as userAPI from "@/api/functions/user.serverFn";
import { UpdateMe } from "@/api/functions/user.serverFn";
import * as userAccountAPI from "@/api/functions/userAccount.serverFn";
import { UpdateMyAccount } from "@/api/functions/userAccount.serverFn";
import * as userInfoAPI from "@/api/functions/userInfo.clientFn";
import { UpdateMyInfo } from "@/api/functions/userInfo.clientFn";
import { GetMyInfo } from "@/api/functions/userInfo.serverFn";

jest.mock("@/api/functions/apiKey.serverFn", () => ({
  CreateMyAPIKey: jest.fn(),
}));

jest.mock("@/api/functions/auth.serverFn", () => ({
  DeleteMe: jest.fn(),
  ForgetPassword: jest.fn(),
  ResetEmail: jest.fn(),
  ResetMe: jest.fn(),
  SendAuthCode: jest.fn(),
  ValidateEmail: jest.fn(),
}));

jest.mock("@/api/functions/blockPack.serverFn", () => ({
  CreateBlockPack: jest.fn(),
  UpdateMyBlockPackById: jest.fn(),
}));

jest.mock("@/api/functions/feedback.serverFn", () => ({
  SubmitFeedbackReport: jest.fn(),
}));

jest.mock("@/api/functions/material.serverFn", () => ({
  CreateMyMaterial: jest.fn(),
  UpdateMyMaterialById: jest.fn(),
}));

jest.mock("@/api/functions/rootShelf.serverFn", () => ({
  CreateRootShelf: jest.fn(),
  UpdateMyRootShelfById: jest.fn(),
  UpsertRootShelfPermission: jest.fn(),
}));

jest.mock("@/api/functions/routine.serverFn", () => ({
  CreateRoutineByStationId: jest.fn(),
  UpdateMyRoutineById: jest.fn(),
}));

jest.mock("@/api/functions/routineTask.serverFn", () => ({
  CreateRoutineTaskByRoutineId: jest.fn(),
  UpdateMyRoutineTaskById: jest.fn(),
}));

jest.mock("@/api/functions/routineTaskDependency.serverFn", () => ({
  UpdateRoutineTaskGraphByRoutineId: jest.fn(),
}));

jest.mock("@/api/functions/station.serverFn", () => ({
  CreateStation: jest.fn(),
  UpdateMyStationById: jest.fn(),
}));

jest.mock("@/api/functions/subShelf.serverFn", () => ({
  CreateSubShelfByRootShelfId: jest.fn(),
  UpdateMySubShelfById: jest.fn(),
}));

jest.mock("@/api/functions/user.serverFn", () => ({ UpdateMe: jest.fn() }));

jest.mock("@/api/functions/userAccount.serverFn", () => ({
  UpdateMyAccount: jest.fn(),
}));

jest.mock("@/api/functions/userInfo.clientFn", () => ({
  UpdateMyInfo: jest.fn(),
}));
jest.mock("@/api/functions/userInfo.serverFn", () => ({
  GetMyInfo: jest.fn(),
}));
const id = "09311e30-6adc-4979-84e1-2912dd200fa4";
const cases = [
  {
    name: "SendAuthCode auth.validation.emailFormat",
    invoke: (request: Parameters<typeof mutationFnSendAuthCode>[0]) =>
      mutationFnSendAuthCode(request, SendAuthCode),
    api: authAPI.SendAuthCode,
    key: "auth.validation.emailFormat",
    valid: {
      body: { email: "fixture@example.invalid" },
      header: { csrfToken: "fixture" },
    },
    invalid: { body: { email: "bad@" }, header: { csrfToken: "fixture" } },
  },
  {
    name: "ValidateEmail validation.authCode",
    invoke: (request: Parameters<typeof mutationFnValidateEmail>[0]) =>
      mutationFnValidateEmail(request, ValidateEmail),
    api: authAPI.ValidateEmail,
    key: "validation.authCode",
    valid: { body: { authCode: "123456" }, header: { csrfToken: "fixture" } },
    invalid: { body: { authCode: "12ab56" }, header: { csrfToken: "fixture" } },
  },
  {
    name: "ResetEmail auth.validation.emailFormat",
    invoke: (request: Parameters<typeof mutationFnResetEmail>[0]) =>
      mutationFnResetEmail(request, ResetEmail),
    api: authAPI.ResetEmail,
    key: "auth.validation.emailFormat",
    valid: {
      body: {
        authCode: "123456",
        confirm: false,
        newEmail: "fixture@example.invalid",
      },
      header: { csrfToken: "fixture" },
    },
    invalid: {
      body: { authCode: "123456", confirm: false, newEmail: "bad@" },
      header: { csrfToken: "fixture" },
    },
  },
  {
    name: "ForgetPassword auth.validation.passwordTooShort",
    invoke: (request: Parameters<typeof mutationFnForgetPassword>[0]) =>
      mutationFnForgetPassword(request, ForgetPassword),
    api: authAPI.ForgetPassword,
    key: "auth.validation.passwordTooShort",
    valid: {
      body: {
        account: "fixture@example.invalid",
        newPassword: "Fixture123!",
        authCode: "123456",
      },
      header: { csrfToken: "fixture" },
    },
    invalid: {
      body: {
        account: "fixture@example.invalid",
        newPassword: "asd",
        authCode: "123456",
      },
      header: { csrfToken: "fixture" },
    },
  },
  {
    name: "ResetMe validation.authCode",
    invoke: (request: Parameters<typeof mutationFnResetMe>[0]) =>
      mutationFnResetMe(request, ResetMe),
    api: authAPI.ResetMe,
    key: "validation.authCode",
    valid: { body: { authCode: "123456" }, header: { csrfToken: "fixture" } },
    invalid: { body: { authCode: "1" }, header: { csrfToken: "fixture" } },
  },
  {
    name: "DeleteMe validation.authCode",
    invoke: (request: Parameters<typeof mutationFnDeleteMe>[0]) =>
      mutationFnDeleteMe(request, DeleteMe),
    api: authAPI.DeleteMe,
    key: "validation.authCode",
    valid: { body: { authCode: "123456" }, header: { csrfToken: "fixture" } },
    invalid: { body: { authCode: "abcdef" }, header: { csrfToken: "fixture" } },
  },
  {
    name: "UpdateMe validation.displayNameLength",
    invoke: (request: Parameters<typeof mutationFnUpdateMe>[0]) =>
      mutationFnUpdateMe(request, UpdateMe),
    api: userAPI.UpdateMe,
    key: "validation.displayNameLength",
    valid: { body: { values: { displayName: "Fixture123" } } },
    invalid: { body: { values: { displayName: "asd" } } },
  },
  {
    name: "UpdateMe validation.displayNameFormat",
    invoke: (request: Parameters<typeof mutationFnUpdateMe>[0]) =>
      mutationFnUpdateMe(request, UpdateMe),
    api: userAPI.UpdateMe,
    key: "validation.displayNameFormat",
    valid: { body: { values: { displayName: "Fixture123" } } },
    invalid: { body: { values: { displayName: "Fixture !!!" } } },
  },
  {
    name: "UpdateMyAccount validation.phone",
    invoke: (request: Parameters<typeof mutationFnUpdateMyAccount>[0]) =>
      mutationFnUpdateMyAccount(request, UpdateMyAccount),
    api: userAccountAPI.UpdateMyAccount,
    key: "validation.phone",
    valid: {
      body: { authCode: "123456", values: { phoneNumber: "123456" } },
      header: { csrfToken: "fixture" },
    },
    invalid: {
      body: { authCode: "123456", values: { phoneNumber: "12e345" } },
      header: { csrfToken: "fixture" },
    },
  },
  {
    name: "UpdateMyAccount auth.validation.emailFormat",
    invoke: (request: Parameters<typeof mutationFnUpdateMyAccount>[0]) =>
      mutationFnUpdateMyAccount(request, UpdateMyAccount),
    api: userAccountAPI.UpdateMyAccount,
    key: "auth.validation.emailFormat",
    valid: {
      body: {
        authCode: "123456",
        values: { backupEmail: "fixture@example.invalid" },
      },
      header: { csrfToken: "fixture" },
    },
    invalid: {
      body: { authCode: "123456", values: { backupEmail: "bad@" } },
      header: { csrfToken: "fixture" },
    },
  },
  {
    name: "UpdateMyInfo validation.headline",
    invoke: (request: Parameters<typeof mutationFnUpdateMyInfo>[0]) =>
      mutationFnUpdateMyInfo(request, UpdateMyInfo),
    api: userInfoAPI.UpdateMyInfo,
    key: "validation.headline",
    valid: { body: { values: { header: "Fixture" } } },
    invalid: { body: { values: { header: "x".repeat(65) } } },
  },
  {
    name: "UpdateMyInfo validation.introduction",
    invoke: (request: Parameters<typeof mutationFnUpdateMyInfo>[0]) =>
      mutationFnUpdateMyInfo(request, UpdateMyInfo),
    api: userInfoAPI.UpdateMyInfo,
    key: "validation.introduction",
    valid: { body: { values: { introduction: "Fixture" } } },
    invalid: { body: { values: { introduction: "x".repeat(257) } } },
  },
  {
    name: "UpdateMyInfo validation.birthDate",
    invoke: (request: Parameters<typeof mutationFnUpdateMyInfo>[0]) =>
      mutationFnUpdateMyInfo(request, UpdateMyInfo),
    api: userInfoAPI.UpdateMyInfo,
    key: "validation.birthDate",
    valid: { body: { values: { birthDate: "2000-01-01" } } },
    invalid: { body: { values: { birthDate: "2999-01-01" } } },
  },
  {
    name: "CreateRootShelf validation.nameRequired",
    invoke: (request: Parameters<typeof mutationFnCreateRootShelf>[0]) =>
      mutationFnCreateRootShelf(request, CreateRootShelf),
    api: rootShelfAPI.CreateRootShelf,
    key: "validation.nameRequired",
    valid: {
      body: { name: "Fixture" },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { name: "   " },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "UpdateMyRootShelfById validation.nameTooLong",
    invoke: (request: Parameters<typeof mutationFnUpdateMyRootShelfById>[0]) =>
      mutationFnUpdateMyRootShelfById(request, UpdateMyRootShelfById),
    api: rootShelfAPI.UpdateMyRootShelfById,
    key: "validation.nameTooLong",
    valid: {
      body: { rootShelfId: id, values: { name: "Fixture" } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { rootShelfId: id, values: { name: "x".repeat(129) } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "CreateSubShelfByRootShelfId validation.nameRequired",
    invoke: (
      request: Parameters<typeof mutationFnCreateSubShelfByRootShelfId>[0]
    ) =>
      mutationFnCreateSubShelfByRootShelfId(
        request,
        CreateSubShelfByRootShelfId
      ),
    api: subShelfAPI.CreateSubShelfByRootShelfId,
    key: "validation.nameRequired",
    valid: {
      body: { rootShelfId: id, prevSubShelfId: null, name: "Fixture" },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { rootShelfId: id, prevSubShelfId: null, name: "   " },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "UpdateMySubShelfById validation.nameTooLong",
    invoke: (request: Parameters<typeof mutationFnUpdateMySubShelfById>[0]) =>
      mutationFnUpdateMySubShelfById(request, UpdateMySubShelfById),
    api: subShelfAPI.UpdateMySubShelfById,
    key: "validation.nameTooLong",
    valid: {
      body: { subShelfId: id, values: { name: "Fixture" } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { subShelfId: id, values: { name: "x".repeat(129) } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "CreateBlockPack validation.nameRequired",
    invoke: (request: Parameters<typeof mutationFnCreateBlockPack>[0]) =>
      mutationFnCreateBlockPack(request, CreateBlockPack),
    api: blockPackAPI.CreateBlockPack,
    key: "validation.nameRequired",
    valid: {
      body: {
        parentSubShelfId: id,
        name: "Fixture",
        icon: null,
        headerBackgroundURL: null,
      },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: {
        parentSubShelfId: id,
        name: "   ",
        icon: null,
        headerBackgroundURL: null,
      },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "UpdateMyBlockPackById validation.nameTooLong",
    invoke: (request: Parameters<typeof mutationFnUpdateMyBlockPackById>[0]) =>
      mutationFnUpdateMyBlockPackById(request, UpdateMyBlockPackById),
    api: blockPackAPI.UpdateMyBlockPackById,
    key: "validation.nameTooLong",
    valid: {
      body: { blockPackId: id, values: { name: "Fixture" } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { blockPackId: id, values: { name: "x".repeat(129) } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "CreateMyMaterial validation.nameRequired",
    invoke: (request: Parameters<typeof mutationFnCreateMyMaterial>[0]) =>
      mutationFnCreateMyMaterial(request, CreateMyMaterial),
    api: materialAPI.CreateMyMaterial,
    key: "validation.nameRequired",
    valid: {
      body: { parentSubShelfId: id, name: "Fixture" },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { parentSubShelfId: id, name: "   " },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "UpdateMyMaterialById validation.nameTooLong",
    invoke: (request: Parameters<typeof mutationFnUpdateMyMaterialById>[0]) =>
      mutationFnUpdateMyMaterialById(request, UpdateMyMaterialById),
    api: materialAPI.UpdateMyMaterialById,
    key: "validation.nameTooLong",
    valid: {
      body: { materialId: id, values: { name: "Fixture" } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { materialId: id, values: { name: "x".repeat(129) } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "CreateStation validation.nameRequired",
    invoke: (request: Parameters<typeof mutationFnCreateStation>[0]) =>
      mutationFnCreateStation(request, CreateStation),
    api: stationAPI.CreateStation,
    key: "validation.nameRequired",
    valid: {
      body: {
        name: "Fixture",
        description: "",
        icon: null,
        headerBackgroundURL: null,
      },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: {
        name: "   ",
        description: "",
        icon: null,
        headerBackgroundURL: null,
      },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "UpdateMyStationById validation.nameTooLong",
    invoke: (request: Parameters<typeof mutationFnUpdateMyStationById>[0]) =>
      mutationFnUpdateMyStationById(request, UpdateMyStationById),
    api: stationAPI.UpdateMyStationById,
    key: "validation.nameTooLong",
    valid: {
      body: { stationId: id, values: { name: "Fixture" } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
    invalid: {
      body: { stationId: id, values: { name: "x".repeat(129) } },
      affected: { rootShelfId: id, prevSubShelfId: null, parentSubShelfId: id },
    },
  },
  {
    name: "CreateStation validation.backgroundUrl",
    invoke: (request: Parameters<typeof mutationFnCreateStation>[0]) =>
      mutationFnCreateStation(request, CreateStation),
    api: stationAPI.CreateStation,
    key: "validation.backgroundUrl",
    valid: {
      body: {
        name: "Fixture",
        description: "",
        icon: null,
        headerBackgroundURL: null,
      },
    },
    invalid: {
      body: {
        name: "Fixture",
        description: "",
        icon: null,
        headerBackgroundURL: "not-url",
      },
    },
  },
  {
    name: "UpdateMyStationById validation.description",
    invoke: (request: Parameters<typeof mutationFnUpdateMyStationById>[0]) =>
      mutationFnUpdateMyStationById(request, UpdateMyStationById),
    api: stationAPI.UpdateMyStationById,
    key: "validation.description",
    valid: { body: { stationId: id, values: { description: "" } } },
    invalid: {
      body: { stationId: id, values: { description: "x".repeat(1025) } },
    },
  },
  {
    name: "CreateRoutineByStationId validation.timeout",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineByStationId>[0]
    ) => mutationFnCreateRoutineByStationId(request, CreateRoutineByStationId),
    api: routineAPI.CreateRoutineByStationId,
    key: "validation.timeout",
    valid: {
      body: {
        stationId: id,
        title: "Fixture",
        description: "",
        timeoutSeconds: 300,
      },
    },
    invalid: {
      body: {
        stationId: id,
        title: "Fixture",
        description: "",
        timeoutSeconds: 59,
      },
    },
  },
  {
    name: "UpdateMyRoutineById validation.timeout",
    invoke: (request: Parameters<typeof mutationFnUpdateMyRoutineById>[0]) =>
      mutationFnUpdateMyRoutineById(request, UpdateMyRoutineById),
    api: routineAPI.UpdateMyRoutineById,
    key: "validation.timeout",
    valid: { body: { routineId: id, values: { timeoutSeconds: 300 } } },
    invalid: { body: { routineId: id, values: { timeoutSeconds: 3601 } } },
  },
  {
    name: "CreateRoutineByStationId workspace.validation.invalidSchedule",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineByStationId>[0]
    ) => mutationFnCreateRoutineByStationId(request, CreateRoutineByStationId),
    api: routineAPI.CreateRoutineByStationId,
    key: "workspace.validation.invalidSchedule",
    valid: {
      body: {
        stationId: id,
        title: "Fixture",
        description: "",
        scheduledStartAt: "2026-01-01",
      },
    },
    invalid: {
      body: {
        stationId: id,
        title: "Fixture",
        description: "",
        scheduledStartAt: "not-date",
      },
    },
  },
  {
    name: "CreateRoutineTaskByRoutineId validation.nameRequired",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) =>
      mutationFnCreateRoutineTaskByRoutineId(
        request,
        CreateRoutineTaskByRoutineId
      ),
    api: routineTaskAPI.CreateRoutineTaskByRoutineId,
    key: "validation.nameRequired",
    valid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1,
      },
    },
    invalid: {
      body: {
        routineId: id,
        title: " ",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1,
      },
    },
  },
  {
    name: "CreateRoutineTaskByRoutineId validation.priority",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) =>
      mutationFnCreateRoutineTaskByRoutineId(
        request,
        CreateRoutineTaskByRoutineId
      ),
    api: routineTaskAPI.CreateRoutineTaskByRoutineId,
    key: "validation.priority",
    valid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1,
      },
    },
    invalid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 101,
        maxAttempts: 1,
      },
    },
  },
  {
    name: "CreateRoutineTaskByRoutineId validation.maxAttempts",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) =>
      mutationFnCreateRoutineTaskByRoutineId(
        request,
        CreateRoutineTaskByRoutineId
      ),
    api: routineTaskAPI.CreateRoutineTaskByRoutineId,
    key: "validation.maxAttempts",
    valid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1,
      },
    },
    invalid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1.5,
      },
    },
  },
  {
    name: "CreateRoutineTaskByRoutineId validation.subShelfRequired",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) =>
      mutationFnCreateRoutineTaskByRoutineId(
        request,
        CreateRoutineTaskByRoutineId
      ),
    api: routineTaskAPI.CreateRoutineTaskByRoutineId,
    key: "validation.subShelfRequired",
    valid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        priority: 0,
        maxAttempts: 1,
      },
    },
    invalid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: {},
        priority: 0,
        maxAttempts: 1,
      },
    },
  },
  {
    name: "UpdateMyRoutineTaskById validation.priority",
    invoke: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[0]
    ) => mutationFnUpdateMyRoutineTaskById(request, UpdateMyRoutineTaskById),
    api: routineTaskAPI.UpdateMyRoutineTaskById,
    key: "validation.priority",
    valid: { body: { routineTaskId: id, values: { priority: 1 } } },
    invalid: { body: { routineTaskId: id, values: { priority: 0.5 } } },
  },
  {
    name: "UpdateMyRoutineTaskById validation.maxAttempts",
    invoke: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[0]
    ) => mutationFnUpdateMyRoutineTaskById(request, UpdateMyRoutineTaskById),
    api: routineTaskAPI.UpdateMyRoutineTaskById,
    key: "validation.maxAttempts",
    valid: { body: { routineTaskId: id, values: { maxAttempts: 1 } } },
    invalid: { body: { routineTaskId: id, values: { maxAttempts: 21 } } },
  },
  {
    name: "UpdateMyRoutineTaskById validation.subShelfRequired",
    invoke: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[0]
    ) => mutationFnUpdateMyRoutineTaskById(request, UpdateMyRoutineTaskById),
    api: routineTaskAPI.UpdateMyRoutineTaskById,
    key: "validation.subShelfRequired",
    valid: {
      body: {
        routineTaskId: id,
        values: {
          payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
        },
      },
    },
    invalid: {
      body: {
        routineTaskId: id,
        values: { payload: { schemaVersion: 1, purpose: "GetSubShelf" } },
      },
    },
  },
  {
    name: "UpdateMyRoutineTaskById validation.startDescription",
    invoke: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[0]
    ) => mutationFnUpdateMyRoutineTaskById(request, UpdateMyRoutineTaskById),
    api: routineTaskAPI.UpdateMyRoutineTaskById,
    key: "validation.startDescription",
    valid: {
      body: {
        routineTaskId: id,
        values: { payload: { schemaVersion: 1, description: "Start" } },
      },
    },
    invalid: {
      body: {
        routineTaskId: id,
        values: {
          payload: { schemaVersion: 1, description: "x".repeat(1025) },
        },
      },
    },
  },
  {
    name: "CreateRoutineTaskByRoutineId validation.blockId",
    invoke: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) =>
      mutationFnCreateRoutineTaskByRoutineId(
        request,
        CreateRoutineTaskByRoutineId
      ),
    api: routineTaskAPI.CreateRoutineTaskByRoutineId,
    key: "validation.blockId",
    valid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: { schemaVersion: 1, purpose: "GetSubShelf", subShelfId: id },
      },
    },
    invalid: {
      body: {
        routineId: id,
        title: "Fixture",
        purpose: "GetSubShelf",
        payload: {
          schemaVersion: 1,
          purpose: "GetSubShelf",
          subShelfId: id,
          pattern: { text: { source: "blockText", blockId: "bad" } },
        },
      },
    },
  },
  {
    name: "UpdateRoutineTaskGraphByRoutineId validation.priority",
    invoke: (
      request: Parameters<typeof mutationFnUpdateRoutineTaskGraphByRoutineId>[0]
    ) =>
      mutationFnUpdateRoutineTaskGraphByRoutineId(
        request,
        UpdateRoutineTaskGraphByRoutineId
      ),
    api: routineTaskDependencyAPI.UpdateRoutineTaskGraphByRoutineId,
    key: "validation.priority",
    valid: {
      body: {
        expectedDefinitionVersion: 1,
        tasks: {
          creates: [],
          updates: [{ routineTaskId: id, values: { priority: 1 } }],
          deletes: [],
        },
        dependencies: { creates: [], updates: [], deletes: [] },
      },
      param: { routineId: id },
    },
    invalid: {
      body: {
        expectedDefinitionVersion: 1,
        tasks: {
          creates: [],
          updates: [{ routineTaskId: id, values: { priority: 101 } }],
          deletes: [],
        },
        dependencies: { creates: [], updates: [], deletes: [] },
      },
      param: { routineId: id },
    },
  },
  {
    name: "CreateMyAPIKey validation.apiKeyName",
    invoke: (request: Parameters<typeof mutationFnCreateMyAPIKey>[0]) =>
      mutationFnCreateMyAPIKey(request, CreateMyAPIKey),
    api: apiKeyAPI.CreateMyAPIKey,
    key: "validation.apiKeyName",
    valid: { body: { name: "Fixture", expiresAt: null }, header: {} },
    invalid: { body: { name: " ", expiresAt: null }, header: {} },
  },
  {
    name: "SubmitFeedbackReport validation.feedbackTitle",
    invoke: (request: Parameters<typeof mutationFnSubmitFeedbackReport>[0]) =>
      mutationFnSubmitFeedbackReport(request, SubmitFeedbackReport),
    api: feedbackAPI.SubmitFeedbackReport,
    key: "validation.feedbackTitle",
    valid: {
      body: {
        type: "bug",
        title: "Fixture",
        description: "Fixture",
        route: "/",
        browserContext: {
          locale: "en",
          timeZone: "UTC",
          platform: "Fixture",
          viewportWidth: 1000,
          viewportHeight: 1000,
        },
      },
      header: { idempotencyKey: id },
    },
    invalid: {
      body: {
        type: "bug",
        title: "   ",
        description: "Fixture",
        route: "/",
        browserContext: {
          locale: "en",
          timeZone: "UTC",
          platform: "Fixture",
          viewportWidth: 1000,
          viewportHeight: 1000,
        },
      },
      header: { idempotencyKey: id },
    },
  },
  {
    name: "SubmitFeedbackReport validation.feedbackDescription",
    invoke: (request: Parameters<typeof mutationFnSubmitFeedbackReport>[0]) =>
      mutationFnSubmitFeedbackReport(request, SubmitFeedbackReport),
    api: feedbackAPI.SubmitFeedbackReport,
    key: "validation.feedbackDescription",
    valid: {
      body: {
        type: "bug",
        title: "Fixture",
        description: "Fixture",
        route: "/",
        browserContext: {
          locale: "en",
          timeZone: "UTC",
          platform: "Fixture",
          viewportWidth: 1000,
          viewportHeight: 1000,
        },
      },
      header: { idempotencyKey: id },
    },
    invalid: {
      body: {
        type: "bug",
        title: "Fixture",
        description: "   ",
        route: "/",
        browserContext: {
          locale: "en",
          timeZone: "UTC",
          platform: "Fixture",
          viewportWidth: 1000,
          viewportHeight: 1000,
        },
      },
      header: { idempotencyKey: id },
    },
  },
  {
    name: "UpsertRootShelfPermission validation.userPublicId",
    invoke: (
      request: Parameters<typeof mutationFnUpsertRootShelfPermission>[0]
    ) =>
      mutationFnUpsertRootShelfPermission(request, UpsertRootShelfPermission),
    api: rootShelfAPI.UpsertRootShelfPermission,
    key: "validation.userPublicId",
    valid: {
      body: { permission: "Read" },
      param: { rootShelfId: id, userPublicId: id },
    },
    invalid: {
      body: { permission: "Read" },
      param: { rootShelfId: id, userPublicId: "not-a-uuid" },
    },
  },
];
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe.each(
  supportedLanguages
)("interactive request validation in %s", language => {
  test.each(
    cases
  )("$name rejects before transport and translates", async entry => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: false });
    let caught: unknown;
    try {
      await entry.invoke(entry.invalid as never);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(NotegicValidationError);
    const error = caught as NotegicValidationError;
    expect(error.getPresentation).toBe(entry.key);
    expect(tError(error, i18n.t)).toBe(i18n.t(entry.key as never));
    expect(tError(error, i18n.t)).not.toBe(entry.key);
    expect(tError(error, i18n.t)).not.toBe(
      i18n.t("error.encounterUnknownError")
    );
    expect(entry.api).not.toHaveBeenCalled();
    const queryClient = createQueryClient();
    const retry = queryClient.getDefaultOptions().mutations?.retry;
    expect(typeof retry === "function" && retry(0, error)).toBe(false);
    queryClient.clear();
  });
});

test.each(cases)("$name leaves malformed responses generic", async entry => {
  (entry.api as jest.Mock).mockResolvedValue({
    success: true,
    data: {},
    exception: null,
  });
  let caught: unknown;
  try {
    await entry.invoke(entry.valid as never);
  } catch (error) {
    caught = error;
  }
  expect(entry.api).toHaveBeenCalledTimes(1);
  expect(caught).toBeInstanceOf(NotegicValidationError);
  expect((caught as NotegicValidationError).getPresentation).toBe(
    "validation.invalidResponse"
  );
});
