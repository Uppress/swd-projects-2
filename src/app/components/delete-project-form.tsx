"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/actions";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

export default function DeleteProjectForm({ projectId }: { projectId: number }) {
  const [state, formAction, pending] = useActionState(deleteProject, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/");
  }, [router, state.ok]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this project and all its tasks?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      {state.errors.form && <p role="alert" className="mb-2 text-xs text-red-700">{state.errors.form}</p>}
      <button type="submit" disabled={pending} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
        {pending ? "Deleting..." : "Delete project"}
      </button>
    </form>
  );
}