"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const IP_TRANSLATIONS = {
  en: "IP Address",
  hi: "आईपी पता",
  bn: "আইপি ঠিকানা",
  gu: "IP સરનામું",
  mr: "IP पत्ता",
  ta: "IP முகவரி",
  te: "IP చిరునామా",
  kn: "IP ವಿಳಾಸ",
  ml: "IP വിലാസം",
  pa: "IP ਪਤਾ",
  od: "IP ଠିକଣା",
};

const TIMELINE_TRANSLATIONS = {
  en: {
    title: "Activity Timeline",
    description: "Recent system and user activity.",
    systemUser: "System Admin",
    performed: "performed",
    on: "on",
  },

  hi: {
    title: "गतिविधि टाइमलाइन",
    description: "हाल की सिस्टम और उपयोगकर्ता गतिविधि।",
    systemUser: "सिस्टम एडमिन",
    performed: "ने किया",
    on: "पर",
  },

  bn: {
    title: "কার্যকলাপ টাইমলাইন",
    description: "সাম্প্রতিক সিস্টেম এবং ব্যবহারকারীর কার্যকলাপ।",
    systemUser: "সিস্টেম অ্যাডমিন",
    performed: "কার্য সম্পাদন করেছেন",
    on: "তে",
  },

  gu: {
    title: "પ્રવૃત્તિ સમયરેખા",
    description: "તાજેતરની સિસ્ટમ અને વપરાશકર્તા પ્રવૃત્તિ.",
    systemUser: "સિસ્ટમ એડમિન",
    performed: "કાર્ય કર્યું",
    on: "પર",
  },

  mr: {
    title: "क्रियाकलाप टाइमलाइन",
    description: "अलीकडील सिस्टम आणि वापरकर्ता क्रियाकलाप.",
    systemUser: "सिस्टम अॅडमिन",
    performed: "कार्य केले",
    on: "वर",
  },

  ta: {
    title: "செயல்பாட்டு காலவரிசை",
    description: "சமீபத்திய அமைப்பு மற்றும் பயனர் செயல்பாடுகள்.",
    systemUser: "சிஸ்டம் நிர்வாகி",
    performed: "செய்தார்",
    on: "இல்",
  },

  te: {
    title: "కార్యాచరణ టైమ్‌లైన్",
    description: "ఇటీవలి సిస్టమ్ మరియు వినియోగదారు కార్యకలాపాలు.",
    systemUser: "సిస్టమ్ అడ్మిన్",
    performed: "చేశారు",
    on: "పై",
  },

  kn: {
    title: "ಚಟುವಟಿಕೆ ಟೈಮ್‌ಲೈನ್",
    description: "ಇತ್ತೀಚಿನ ಸಿಸ್ಟಮ್ ಮತ್ತು ಬಳಕೆದಾರ ಚಟುವಟಿಕೆ.",
    systemUser: "ಸಿಸ್ಟಮ್ ನಿರ್ವಾಹಕರು",
    performed: "ಕಾರ್ಯ ನಿರ್ವಹಿಸಿದರು",
    on: "ಮೇಲೆ",
  },

  ml: {
    title: "പ്രവർത്തന ടൈംലൈൻ",
    description: "സമീപകാല സിസ്റ്റം, ഉപയോക്തൃ പ്രവർത്തനങ്ങൾ.",
    systemUser: "സിസ്റ്റം അഡ്മിൻ",
    performed: "പ്രവർത്തനം നടത്തി",
    on: "ൽ",
  },

  pa: {
    title: "ਗਤੀਵਿਧੀ ਟਾਈਮਲਾਈਨ",
    description: "ਹਾਲੀਆ ਸਿਸਟਮ ਅਤੇ ਉਪਭੋਗਤਾ ਗਤੀਵਿਧੀ।",
    systemUser: "ਸਿਸਟਮ ਐਡਮਿਨ",
    performed: "ਨੇ ਕਾਰਵਾਈ ਕੀਤੀ",
    on: "ਤੇ",
  },

  od: {
    title: "କାର୍ଯ୍ୟକଳାପ ଟାଇମଲାଇନ୍",
    description: "ସାମ୍ପ୍ରତିକ ସିଷ୍ଟମ୍ ଏବଂ ବ୍ୟବହାରକାରୀ କାର୍ଯ୍ୟକଳାପ।",
    systemUser: "ସିଷ୍ଟମ୍ ଆଡମିନ୍",
    performed: "କାର୍ଯ୍ୟ କଲେ",
    on: "ରେ",
  },
};

const AuditTimeline = ({ logs = [] }) => {
  const { t, i18n } = useTranslation();

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  )
    .split("-")[0]
    .toLowerCase();

  const timeline =
    TIMELINE_TRANSLATIONS[language] ||
    TIMELINE_TRANSLATIONS.en;

  const ipLabel =
    IP_TRANSLATIONS[language] ||
    IP_TRANSLATIONS.en;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      i18n.language || "en-IN",
      {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        numberingSystem: "latn",
      }
    ).format(parsedDate);
  };

  const getActionLabel = (action) => {
    if (!action) return "-";

    const key = String(action).toUpperCase();

    const result = t(`audit.action.${key}`, {
      defaultValue: key,
    });

    return result;
  };

  const getResourceLabel = (resource) => {
    if (!resource) return "-";

    const key = String(resource).toUpperCase();

    return t(`audit.resource.${key}`, {
      defaultValue: resource,
    });
  };

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div
      className="
        rounded-lg
        bg-white
        p-5
        transition-colors
        dark:bg-[#161b22]
      "
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
          {timeline.title}
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
          {timeline.description}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {logs.map((log, index) => {
          const actionLabel = getActionLabel(
            log?.action
          );

          const resourceLabel = getResourceLabel(
            log?.entityType ||
              log?.resource ||
              log?.resourceType
          );

          const userName =
            log?.userName ||
            log?.username ||
            timeline.systemUser;

          const resourceId =
            log?.entityId ||
            log?.resourceId;

          const ipAddress =
            log?.ipAddress ||
            log?.ip ||
            "-";

          return (
            <div
              key={log?.id || index}
              className="relative pl-10"
            >
              {/* Dot */}
              <div
                className="
                  absolute
                  left-0
                  top-1
                  h-4
                  w-4
                  rounded-full
                  border-4
                  border-gray-300
                  bg-white
                  dark:border-[#6e7681]
                  dark:bg-[#0d1117]
                "
              />

              {/* Line */}
              {index !== logs.length - 1 && (
                <div
                  className="
                    absolute
                    left-[7px]
                    top-5
                    h-full
                    w-px
                    bg-gray-200
                    dark:bg-[#30363d]
                  "
                />
              )}

              {/* Action / Time */}
              <div className="mb-2 flex items-center justify-between gap-4">
                <span
                  className="
                    rounded-full
                    bg-green-100
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-green-700
                    dark:bg-green-500/10
                    dark:text-green-400
                  "
                >
                  {actionLabel}
                </span>

                <span className="text-xs text-gray-500 dark:text-[#8b949e]">
                  {formatDate(
                    log?.createdAt ||
                      log?.timestamp ||
                      log?.date
                  )}
                </span>
              </div>

              {/* Details */}
              <div
                className="
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  dark:border-[#30363d]
                  dark:bg-[#161b22]
                "
              >
                <p className="text-sm text-gray-700 dark:text-[#c9d1d9]">
                  <strong className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {userName}
                  </strong>

                  {" "}

                  {timeline.performed}

                  {" "}

                  <strong className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {actionLabel}
                  </strong>

                  {" "}

                  {timeline.on}

                  {" "}

                  <strong className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {resourceLabel}
                  </strong>

                  {resourceId !== undefined &&
                    resourceId !== null &&
                    resourceId !== "" && (
                      <>
                        {" #"}
                        {resourceId}
                      </>
                    )}
                </p>

                {/* FIXED IP LABEL */}
                <p className="mt-2 text-xs text-gray-500 dark:text-[#8b949e]">
                  {ipLabel}: {ipAddress}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditTimeline;