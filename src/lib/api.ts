const BASE = "https://made10.retescuolevallagarina.it";

export type SchoolType = {
  id: string;
  name: string;
  description: string | null;
};

export type SchoolPhone = { id: string; number: string; label: string | null };
export type SchoolEmail = { id: string; email: string; label: string | null };
export type SchoolVideo = {
  id: string;
  title: string | null;
  description: string | null;
  video_file: string | null;
  youtube_id: string | null;
  type: string | null;
};

export type School = {
  id: string;
  name: string;
  short_name: string | null;
  type: string | SchoolType;
  logo: string | null;
  website_url: string | null;
  description: string | null;
  detailed_info: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  miur_code: string | null;
  responsabile_orientamento: string | null;
  canteen: boolean;
  boarding: boolean;
  main_campus: boolean;
  position: { type: "Point"; coordinates: [number, number] } | null;
  school_phones?: SchoolPhone[];
  school_emails?: SchoolEmail[];
  videos?: SchoolVideo[];
};

export type SchoolEvent = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  online_link: string | null;
  school: string | { id: string; name: string; short_name?: string | null };
};

export const fileUrl = (id: string | null | undefined, w = 400) =>
  id ? `${BASE}/assets/${id}?width=${w}&quality=80` : null;

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export const fetchSchools = () =>
  getJSON<School[]>(
    "/items/schools?limit=-1&fields=*,type.id,type.name,type.description"
  );

export const fetchSchool = (id: string) =>
  getJSON<School>(
    `/items/schools/${id}?fields=*,type.id,type.name,type.description,school_phones.id,school_phones.number,school_phones.label,school_emails.id,school_emails.email,school_emails.label,videos.id,videos.title,videos.description,videos.video_file,videos.youtube_id,videos.type`
  );

export const fetchSchoolTypes = () =>
  getJSON<SchoolType[]>("/items/school_types?limit=-1");

export const fetchEvents = () =>
  getJSON<SchoolEvent[]>(
    "/items/events?limit=-1&sort=start_date&fields=*,school.id,school.name,school.short_name"
  );

export const fetchEventsForSchool = (schoolId: string) =>
  getJSON<SchoolEvent[]>(
    `/items/events?limit=-1&sort=start_date&filter[school][_eq]=${schoolId}`
  );
