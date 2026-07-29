import React from "react";

const ProfileCard = ({ user }) => {
  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }

    return user?.email?.[0]?.toUpperCase() || "?";
  };

  const getRoleLabel = (role) => {
    const map = {
      ROLE_HOST: "Host",
      ROLE_ADMIN: "Admin",
    };

    return map[role] || "";
  };

  const getRoleBadgeClasses = (role) => {
    const map = {
      ROLE_HOST:
        "text-emerald-600 bg-emerald-500/[0.07] border-emerald-500/[0.12]",

      ROLE_ADMIN:
        "text-violet-600 bg-violet-500/[0.07] border-violet-500/[0.12]",
    };

    return map[role] || "";
  };

  const getAvatarRing = (role) => {
    const map = {
      ROLE_HOST: "ring-emerald-500/[0.12]",
      ROLE_ADMIN: "ring-violet-500/[0.12]",
    };

    return map[role] || "ring-neutral-900/[0.06]";
  };

  const displayRoleFlag =
    user?.role === "ROLE_HOST" || user?.role === "ROLE_ADMIN";

  return (
    <section
      className="
        rounded-md
        bg-gradient-to-b
        from-white
        to-neutral-50

        border
        border-neutral-200

        shadow-[0_1px_2px_rgba(0,0,0,0.03)]

        px-5
        py-5

        transition-colors
        duration-150

        hover:border-neutral-300
      "
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}

        <div
          className={`
            w-12
            h-12
            rounded-full
            bg-neutral-900
            text-white

            flex
            items-center
            justify-center

            text-[18px]
            font-semibold
            tracking-tight

            ring-4
            ${getAvatarRing(user?.role)}

            shrink-0
          `}
        >
          {getInitials(user)}
        </div>

        {/* Details */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="
                text-[15px]
                md:text-[18px]
                font-semibold
                tracking-tight
                text-neutral-900
                break-words

              "
            >
              {user?.firstName} {user?.lastName}
            </h2>

            {displayRoleFlag && (
              <span
                className={`
                  inline-flex
                  items-center

                  rounded-sm

                  px-1.5
                  py-0.5

                  text-[10px]
                  font-semibold

                  uppercase
                  tracking-widest

                  border

                  select-none

                  ${getRoleBadgeClasses(user?.role)}
                `}
              >
                {getRoleLabel(user?.role)}
              </span>
            )}
          </div>

          <div
            className="
              mt-1

              flex
              flex-col
              gap-0.5

              text-[12px]
              md:text-[13px]
            "
          >
            <span
              className="
                text-neutral-500
                font-medium
                break-words
              "
            >
              {user?.email}
            </span>

            {user?.phone && (
              <span
                className="
                  text-neutral-400
                  font-normal
                  break-words
                  text-[12px]
                  md:text-[13px]
                "
              >
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
