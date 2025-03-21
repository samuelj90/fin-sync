import { apiConfig } from "@/config/api";
import { BaseAuth } from "./BaseAuth";
import { httpClient } from "../http-client";
import type User from "@/models/user";
import axios from "axios";

export class DefaultAuth extends BaseAuth {
  login(email: string, password: string): Promise<User> {
    return httpClient
      .post<{
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
      }>(
        `/auth/token`,
        new URLSearchParams({
          grant_type: "password",
          username: email,
          password: password,
          client_id: "web-app",
          client_secret: "secret",
          scope: "",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        }
      )
      .then(async (response) => {
        console.log("Login response:", response);
        const { data } = response;
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        const userResponse = await this.getUser();
        console.log("User response:", userResponse);
        const user: User = {
          id: "",
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresAt: data.expires_in,
          accessTokenType: data.token_type,
          name: userResponse.name,
          email: userResponse.email,
          avatar: "",
          provider: "default",
          emailVerified: userResponse.email_verified,
          lastLogin: "",
          roles: [],
          permissions: [],
          createdAt: "",
          updatedAt: "",
        };
        return user;
      })
      .catch((error) => {
        console.log("Error in fetching token", error);
        throw new Error("Login failed");
      });
  }

  register(email: string, password: string): Promise<User> {
    console.log("Register method not implemented", email, password);
    throw new Error("Method not implemented.");
  }

  private getUser(): Promise<{
    name: string;
    email: string;
    email_verified: boolean;
  }> {
    return httpClient
      .get<{
        name: string;
        email: string;
        email_verified: boolean;
      }>(`/auth/userinfo`)
      .then((response) => response.data)
      .catch((error) => {
        console.log("Error fetching user info:", error);
        throw new Error("Failed to retrieve user");
      });
  }

  logout(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
